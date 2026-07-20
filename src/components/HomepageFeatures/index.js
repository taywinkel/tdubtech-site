import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Tech related stuff I find useful',
    image: require('@site/static/img/drakeDuck.png').default,
    description: (
      <>
        I am using this site as a repository of all the tech related stuff I find useful. 
        This includes but is not limited to: <b>programming, web development, cloud computing, and more</b>.
      </>
    ),
  }
];

function Feature({image, title, description}) {
  return (
    <div className={clsx('col col--6 col--offset-3')}>
      <div className="text--center">
        <img src={image} className={styles.featureSvg} alt={title} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
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
