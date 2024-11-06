import styles from "./aboutUsLayout.module.css";

const AboutUsLayout = ({ children }: { children: React.ReactNode }) => {
  return <main className={styles.main}>{children}</main>;
};

export default AboutUsLayout;
