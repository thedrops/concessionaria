import { prisma } from "@/lib/prisma";

interface CustomScriptsProps {
  position: "HEAD" | "BODY_START" | "BODY_END";
}

async function getScripts(position: string) {
  try {
    const scripts = await prisma.customScript.findMany({
      where: {
        isActive: true,
        position: position as any,
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        content: true,
      },
    });
    return scripts;
  } catch (error) {
    console.error("Error fetching scripts:", error);
    return [];
  }
}

export default async function CustomScripts({ position }: CustomScriptsProps) {
  const scripts = await getScripts(position);

  if (scripts.length === 0) {
    return null;
  }

  return (
    <>
      {scripts.map((script) => (
        <div
          key={script.id}
          dangerouslySetInnerHTML={{ __html: script.content }}
        />
      ))}
    </>
  );
}
