import styles from "./SupportLayout.module.css";

const SupportLayout = ({ children }: { children: React.ReactNode }) => {
  return <main className={styles.main}>{children}</main>;
};

export default SupportLayout;
