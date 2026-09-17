---
title: Rocky Linux 9.8 Gnome Kiosk
---

# Rocky Linux 9.8 with `gnome-kiosk-session`
Rocky Linux is a free, open source Linux distro that is part of the Red Had Linux family. It is intended to be compatible with nearly everything on Red Hat Enterprise Linux (or RHEL).  RHEL is an enterprise version of Linux, the type of distro that large companies or government entities typically utilize. Since Rocky OS is compatible with RHEL, this tutorial should work the exact same on RHEL. 

There is benefit to using Rocky over other distros if you do work with Enterprises that utilize RHEL. If you are in the business of selling or supporting kiosk-type systems, you can deploy your kiosks using Rocky OS. Then if a customer requires RHEL, the code and procedure for deployment is the exact same. Either way, your customers get enterprise level Linux.

### Advantages
* **Compatibility with RHEL:** Rocky OS has direct compatibility with Red Hat Enterprise Linux, because it is downstream from RHEL developement. This means anything you design on Rocky OS should work flawlessly on RHEL, and vice-versa. You have less code to maintain!
* **Free to Use:** You can deploy Rocky OS without licensing issues that follow RHEL. 
* **Emphasis on Security:** Rocky is built with the same emphasis on security as RHEL. It even includes out-of-the-box support for security standards such as DISA-STIG.
* **Long System Support:** Rocky, like RHEL, recieves feature support for 5 years from first release, and an additional 5 years of security updates. A total of 10 years!

### Disadvantages
* **Community Backed:** While this is a plus for many applications, this may be a weak point for your kiosk as it is not directly endorsed by the Red Hat Team. If you need enterprise guarantees, RHEL may be the better option.
* **Old Packages:** This is a symptom of that long support interval. Rocky OS opts for very conservative/old packages that are better tested against bugs. This does pose compatiblity issues with some applications. 
* **Limited Repository:** Rocky OS supports a very limited set of applications and packages in their standard repository. Again, a symptom of high reliability and longevity. They have their extras repository called EPEL, but some companies may disapprove the use of packages from there. Only the standard repository gets support and updates from the Rocky Team. 
* **`gnome-kiosk-session` Limitations:** `gnome-kiosk-session` is a stripped down gnome session that only ever displays one application. This is fantastic for ever showing one thing- exactly what a kiosk should do- but lacks any support for an on-screen keyboard. That means if you require a keyboard, it must be wrapped up inside of your application. In the case of this tutorial, we use Firefox with a custom, local keyboard extension.

# Web Kiosk Setup Example

Rocky Linux and RHEL have their best stability when you utilize software from their standard repositories.

This Web Kiosk uses the following stack:

* **OS:** Rocky Linux 9.8 Server with GUI
* **Compositor:** `gnome-kiosk-session`
* **OSK:** web browser keyboard extension (like `simple-keyboard` by hedgeof)
* **Browser:** `firefox`

:::note

I have included a copy of a deployment script created for setting up a web kiosk for a Codesys runtime below. It is a good example and includes many of the same commands in this tutorial. Keep in mind that this is mainly a starting point for getting your code working properly.

:::

### 1. Install Rocky Linux OS 9.8 (Server with GUI)

You will need to install Rocky Linux OS 9.8 on your device. This process is pretty simple using the Anaconda installation tool that comes with the Rocky OS image. Make sure to select the option "Serve with GUI" to ensure all necessary packages for `gnome-kiosk-session` are included. 

### 2. Install Necessary Kiosk Packages

:::note
This example includes automatic background updates through dnf-automatic. You can opt to skip this.
:::

```bash
sudo dnf install -y gnome-kiosk gnome-kiosk-script-session firefox dnf-automatic 
```

### 3. Create a dedicated Kiosk User 

Create a user named kiosk without a password. This will be the user that is logged on automatically to the kiosk environment. They will have limited rights to the system.

```bash
sudo useradd -m -s /bin/bash kiosk || true 
sudo passwd -d kiosk
```

### 4. Grant the Kiosk User Backlight Control Permissions

This command creates a file at location `/etc/udev/rules.d/99-backlight.rules` which gives the Kiosk user permission to control the backlight.

:::note

This section is optional, but beneficial if your kiosk is allowed to turn off the display. It will save your backlight and allow your equipment to last longer.

:::

```bash
sudo tee /etc/udev/rules.d/99-backlight.rules > /dev/null << 'EOF' 

SUBSYSTEM=="backlight", ACTION=="add", RUN+="/bin/chgrp video /sys/class/backlight/%k/brightness", RUN+="/bin/chmod g+w /sys/class/backlight/%k/brightness" 

EOF
```
### 5. Grant the Kiosk User Control Over the Display

```bash
sudo usermod -aG video kiosk
```

### 6. Create The `gnome-kiosk-script`
This script will control how the kiosk behaves once powered on. The main sections of the script control the following: 

* Prevents the screen from locking due to inactivity.
* controls the Backlight, turning if off after 10 minutes (600 seconds) of inactivity.
* Preventing Firefox from displaying the website until the website is available (for asthetic purposes).
* Pointing Firefox at the correct website and ensuring it runs indefinitely.

The command creates the script at `/home/kiosk/.local/bin/gnome-kiosk-script` and controls the kiosk environment.

```bash
sudo -u kiosk tee /home/kiosk/.local/bin/gnome-kiosk-script > /dev/null << 'EOF' 

#!/bin/sh 

gsettings set org.gnome.desktop.session idle-delay 600 
gsettings set org.gnome.desktop.screensaver lock-enabled false 
gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing' 

(
  BL=$(ls /sys/class/backlight | head -n1) 
  BLPATH="/sys/class/backlight/$BL/brightness" 
  ORIG=$(cat "$BLPATH") 

  dbus-monitor --session "type='signal',interface='org.gnome.SessionManager.Presence',member='StatusChanged'" | 
  while read -r line; do 
    case "$line" in 
      *"uint32 0"*) 
        echo "$ORIG" > "$BLPATH" 
        ;; 
      *"uint32 "[1-3]*) 
        ORIG=$(cat "$BLPATH") 
        echo 0 > "$BLPATH" 
        ;; 
    esac 
  done 
) & 
# Wait until CODESYS WebVisu responds 
until curl -fs http://127.0.0.1:8080/webvisu.htm >/dev/null 2>&1; do 
    sleep 1 
done 
while true; do 
    firefox --kiosk http://127.0.0.1:8080/webvisu.htm 
    sleep 1 
done 

EOF 
```

### 7. Give the Kiosk User Permission to Access/Run this Script

```bash
sudo chmod +x /home/kiosk/.local/bin/gnome-kiosk-script
```

### 8. Configure `AccountsService` for `auto-session` Selection

This command will create/edit the configuration file at `/var/lib/AccountsService/users/kiosk` to automatically start our kiosk environment using the `gnome-kiosk-script` we created/edited earlier. 

```bash
sudo tee /var/lib/AccountsService/users/kiosk > /dev/null << 'EOF' 

[User] 
Session=gnome-kiosk-script 
SystemAccount=false 

EOF 
```

### 9. Configure Gnome Display Manager (GDM) Auto-Login

This command creates/edits the file at `/etc/gdm/custom.conf` which is responsible for allowing GDM to automatically log in our Kiosk User without entering a username or password. 

```bash
sudo tee /etc/gdm/custom.conf > /dev/null << 'EOF' 

[daemon] 
AutomaticLoginEnable=True 
AutomaticLogin=kiosk 

[security] 
[xdmcp] 
[chooser] 
[debug] 

EOF 
```
### 10. Setup the Directory Structure for Firefox Extensions
This command sets up the directories where we will store our local keyboard extension. For this tutorial, we use a custom version of Hodgef's `simple-keyboard` available at: 

https://github.com/hodgef/simple-keyboard

:::note
A detailed explanation on how to configure this keyboard will be coming soon...
:::

```bash
sudo mkdir -p /opt/kiosk-extensions 
sudo mkdir -p /opt/kiosk-nowhere 
sudo chmod 755 /opt/kiosk-extensions 
sudo chmod 000 /opt/kiosk-nowhere 
# This next line assumes your keyboard extension is named kiosk-keyboard.xpi and is located at /tmp/kiosk-keyboard.xpi
sudo mv /tmp/kiosk-keyboard.xpi /opt/kiosk-extensions/ 
sudo chown root:root /opt/kiosk-extensions/kiosk-keyboard.xpi 
sudo chmod 644 /opt/kiosk-extensions/k
```

### 11. Configure Enterprise Firefox Policies

Firefox is a full fledged desktop web browser. That means that it contains all the functionality you would expect such as: printing, downloads, updates, developer tools, etc. These are all things you do not want in a kiosk. 

Firefox expected this an created a method of disabling all of these features to create a locked down kiosk session. This is done through enterprise Firefox policies. 

This command will create a file at `/etc/firefox/policies` to lock down our Firefox session. It will also enable our local keyboard extension.

```bash
sudo mkdir -p /etc/firefox/policies 
sudo tee /etc/firefox/policies/policies.json > /dev/null << 'EOF' 

{ 
  "policies": { 
    "Homepage": { 
      "URL": "http://127.0.0.1:8080/webvisu.htm", 
      "Locked": true, 
      "StartPage": "homepage" 
    }, 
    "PrintingEnabled": false, 
    "DisableAppUpdate": true, 
    "BackgroundAppUpdate": false, 
    "AppAutoUpdate": false, 
    "DisableDeveloperTools": true, 
    "DisableSecurityBypass": { 
      "InvalidCertificate": false, 
      "SafeBrowsing": false 
    }, 
    "DisableSetDesktopBackground": true, 
    "DisableFirefoxScreenshots": true, 
    "DisableFirefoxAccounts": true, 
    "DisableFirefoxStudies": true, 
    "DisableTelemetry": true, 
    "DisableProfileImport": true, 
    "DisableProfileRefresh": true, 
    "DisableSafeMode": true, 
    "DisableFeedbackCommands": true, 
    "DisplayMenuBar": "never", 
    "DisplayBookmarksToolbar": "never", 
    "NoDefaultBookmarks": true, 
    "DontCheckDefaultBrowser": true, 
    "OverrideFirstRunPage": "", 
    "OverridePostUpdatePage": "", 
    "PromptForDownloadLocation": false, 
    "DownloadDirectory": "/opt/kiosk-nowhere", 
    "Preferences": { 
      "xpinstall.signatures.required": { 
        "Value": false, 
        "Status": "locked" 
      } 
    }, 
    "ExtensionSettings": { 
      "kiosk-keyboard@grisleyautomation.com": { 
        "installation_mode": "force_installed", 
        "install_url": "file:///opt/kiosk-extensions/kiosk-keyboard.xpi" 
      } 
    } 
  } 
} 

EOF 
```

### 12. `firewalld` permissions
I am going to skip explaining this section. It is important but very specific to your use case. If you are accessing a public web page on your kiosk, you will most likely have no need for this step. If an application or service on your device requires outside communication, this step may be required. 

Take a look at the example script at the end of this tutorial if you want to see how `firewalld` was configured for a Codesys runtime.

### 13. Configure Automatic Security Updates
This command will create/edit a file at `/etc/dnf/automatic.conf` which will request security updates for the device. I opted just for security updates to prevent a feature update breaking the system somehow. Your mileage with this tool may vary. 

:::note
This section is optional and should be skipped if you did not install dnf-automatic
:::

```bash
sudo tee /etc/dnf/automatic.conf > /dev/null << 'EOF' 

[commands] 
upgrade_type = security 
random_sleep = 0 
network_online_timeout = 60 
download_updates = yes 
apply_updates = yes 

[emitters] 
emit_via = stdio 

[base] 
debuglevel = 1

EOF 

sudo systemctl enable --now dnf-automatic.timer
```

# Conclusion
That's it! This will provide you with a locked down web kiosk that utilizes an enterprised linux distro. 

:::note
The deployment script will be available here at a later date!
:::