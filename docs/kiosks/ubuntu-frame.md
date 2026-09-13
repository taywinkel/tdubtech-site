---
title: Ubuntu-Frame Kiosk
---

# Ubuntu Frame Kiosk

Ubuntu is one of the most well known Linux distros between hobbyists and enterprise users. Owned by Canonical, Ubuntu is a solid operating system built on top of the latest stable build of Debian, and attempts to make the system better, simpler, and more useable. 

Ubuntu makes kiosk deployments easy as well. They created their own kiosk system called Ubuntu Frame. It is based on Canonical's own Mir Display Server. Ubuntu Frame displays only one application, and also keeps the optoin to apply an On-screen keyboard, through the use of Ubuntu-Frame-OSK. You can also add ubuntu-frame-vnc which allows remote control of the kiosk, which could be useful for helping clients or fixing bugs. 

This kiosk stack is by far the easiest to install and setup. There is nearly zero config file editing (unless you want to customize the environment such as the OSK). It is also backed by one of the largest Linux proponents in the industry so you know it will work well. 

### Advantages 

**Simple Setup:** Basic installation in literally 11 steps. That is amazing.  

**Lightweight:** Moderate on resources. There is no desktop environment installed with this one.  

**Automated Session:** Login is automatically managed.

**Solid Base:** Based on Debian  

**Long-Term Support:** Service package is good for five years (from release date). You can get support for 15 years if you subscribe your Kiosk to Ubuntu Pro. 

### Disadvantages 

**Snap Dependent:** Utilizes Snaps. This may be an issue depending on who you speak with. 

**Customization Limited:** Less customizability than other kiosk environments

**Real-Time Kernel Restricted:** Real-time Linux kernel only available behind a paywall (if you require this that is) 


# Web Kiosk Setup Example

This Web Kiosk uses the following stack:

**OS:** Ubuntu Server 26.04.1 LTS

**Compositor:** ubuntu-frame

**OSK:** ubuntu-frame-osk

**Browser:** Chromium

### 1. Install Ubuntu Server Minimized
The first step is to install Ubuntu Server on your machine. Select the **Minimized** version so as to reduce bloat installed on the system overall.

### 2. Install basic tools 

```bash
sudo apt install nano htop net-tools dmidecode smartmontools chrony ufw tmux -y 
```
### 2. Install Ubuntu-Frame (the display compositor) 

```bash
sudo snap install ubuntu-frame 
```

### 3. Install ubuntu-frame-osk (on-screen keyboard)

```bash
sudo snap install ubuntu-frame-osk 
```

### 4. Install Chromium (completed via snaps)

```bash
sudo snap install chromium 
```
### 5. Connect Services to Each Other and Set The URL

Set up ubuntu-frame to start automatically at startup
```bash
sudo snap set ubuntu-frame daemon=true 
```

Connect ubuntu-frame-osk to the ubuntu-frame wayland socket
```bash
sudo snap connect ubuntu-frame-osk:wayland 
```

Set up ubuntu-frame-osk to start automatically at startup
```bash
sudo snap set ubuntu-frame-osk daemon=true 
```

Set the target webpage for the chromium application
```bash
sudo snap set chromium url=https://google.com 
```

Hide the mouse/cursor (you can skip this option if you're not setting up a touchscreen)
```bash
sudo snap set ubuntu-frame config="cursor=null" 
```

Connect the Chromium Wayland interface to Ubuntu-Frame
```bash
sudo snap connect chromium:wayland 
```
Configure Chromium to start automatically at startup
```bash
sudo snap set chromium daemon=true
```

That's it! They made this stack incredibly easy. For simple applications where you want easy implementation, and want a kiosk with corporate backing, this is a fantastic kiosk option. 

If you're curious about learning more, visit their site
https://ubuntu.com/frame