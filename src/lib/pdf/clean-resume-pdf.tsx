import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Resume } from "@/types";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#2563eb",
  },
  row: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
    fontSize: 9,
    color: "#374151",
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#111827",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 4,
  },
  body: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 1.45,
  },
  itemTitle: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: 700,
  },
  muted: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
});

function href(value: string, type?: "email" | "phone") {
  if (!value) return "";
  if (type === "email") return `mailto:${value}`;
  if (type === "phone") return `tel:${value.replace(/\s+/g, "")}`;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value}`;
}

export function CleanResumePdf({ resume }: { resume: Resume }) {
  const personal = resume.personalInfo;

  return (
    <Document title={`${personal.fullName || "Resume"} - Resume`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{personal.fullName}</Text>
        <Text style={styles.subtitle}>{personal.jobTitle}</Text>
        <View style={styles.row}>
          <Link src={href(personal.email, "email")}>{personal.email}</Link>
          <Link src={href(personal.phone, "phone")}>{personal.phone}</Link>
          <Text>{personal.location}</Text>
          <Link src={href(personal.website)}>{personal.website}</Link>
          <Link src={href(personal.github)}>{personal.github}</Link>
          <Link src={href(personal.linkedin)}>{personal.linkedin}</Link>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.body}>{personal.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {resume.experience.map((item) => (
            <View key={item.id}>
              <Text style={styles.itemTitle}>
                {item.role} - {item.company}
              </Text>
              <Text style={styles.muted}>
                {item.location} · {item.startDate} - {item.current ? "Present" : item.endDate}
              </Text>
              {item.bullets.map((bullet) => (
                <Text key={bullet} style={styles.body}>
                  • {bullet}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {resume.projects.map((project) => (
            <View key={project.id}>
              <Text style={styles.itemTitle}>{project.name}</Text>
              <Text style={styles.body}>{project.description}</Text>
              {project.liveUrl ? <Link src={href(project.liveUrl)}>{project.liveUrl}</Link> : null}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
