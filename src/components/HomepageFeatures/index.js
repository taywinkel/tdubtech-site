import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Tutorials & Guides',
    image: require('@site/static/img/drakeDuckthumbsup.png').default,
    description: (
      <>
        Step-by-step walkthroughs for everything ranging from Industrial Automation to Web Development.
      </>
    ),
  },
  {
    title: 'Tech Projects & Reviews',
    image: require('@site/static/img/drakeDuckcomputer.png').default,
    description: (
      <>
        Reviews of both the latest tech, and not so new tech. PLC's, microcontrollers, computers, and more!
      </>
    ),
  },
];

function Feature({image, title, description}) {
  return (
    // 'col--md-6' keeps them side-by-side on desktop/tablets, while 'col--12' stacks them on mobile
    <div className={clsx('col col--6 col--md-12 padding-horiz--lg margin-bottom--xl')}>
      <div className="text--center">
        <img src={image} className={styles.featureSvg} alt={title} role="img" />
      </div>
      <div className="text--center margin-top--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}