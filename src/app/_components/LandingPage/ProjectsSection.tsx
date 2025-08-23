import Image from "next/image"; // Import Image from Next.js
import Link from "next/link"; // Use Next.js Link for routing

import styles from "./ProjectsSection.module.css";

// Function to fetch projects from the API
async function getProjects() {
  try {
    const response = await fetch(`${process.env.BASE_URL}/api/projects`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

const ProjectsSection = async () => {
  const projects = await getProjects();

  return (
    <div className={styles.container}>
      <h2>پروژه‌ها</h2>
      <div className={styles.project_parent}>
        <div className={styles.projects}>
          {projects.length > 0 ? (
            projects.map((p) => (
              <Link key={p.id} href={`/about-us/projects/${p.slug}`} className={styles.project}>
                <Image
                  src={`${process.env.LIARA_BUCKET_URL}/${p.mainImg}`}
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
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>هیچ پروژه ای یافت نشد</p>
            </div>
          )}
        </div>
      </div>
      <Link href="/about-us/projects" className={styles.all_projects}>
        مشاهده تمامی پروژه‌های انجام شده
      </Link>
    </div>
  );
};

export default ProjectsSection;
