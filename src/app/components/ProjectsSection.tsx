import Link from "next/link"; // Use Next.js Link for routing
import Image from "next/image"; // Import Image from Next.js
import projects from "../constants/projects.json"; // Ensure projects is imported correctly
import styles from "./ProjectsSection.module.css";

const ProjectsSection = () => {
  const result = [projects[0], projects[1], projects[2]];
  return (
    <div className={styles.container}>
      <h2>پروژه‌ها</h2>
      <div className={styles.project_parent}>
        <div className={styles.projects}>
          {result.map((p) => (
            <Link
              key={p.id}
              href={`/about-us/projects/${p.id}`}
              className={styles.project}
            >
              <Image
                src={p.mainImg}
                loading="lazy"
                alt={p.title}
                height={250}
                width={700}
              />
              <div className={styles.details}>
                <h4>{p.title}</h4>
                <p>{p.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Link href="/about-us/projects" className={styles.all_projects}>
        مشاهده تمامی پروژه‌های انجام شده
      </Link>
    </div>
  );
};

export default ProjectsSection;
