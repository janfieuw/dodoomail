export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const pixel = Buffer.from(
    "R0lGODlhAQABAPAAAAAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
    "base64"
  );

  try {
    const { prisma } = await import("@/lib/prisma");

    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get("id");

    if (trackingId) {
      const sendLog = await prisma.mailSendLog.findUnique({
        where: { trackingId },
      });

      if (sendLog) {
        await prisma.mailOpen.create({
          data: {
            contactId: sendLog.contactId,
            trackingId,
            ip: request.headers.get("x-forwarded-for") || null,
            userAgent: request.headers.get("user-agent") || null,
          },
        });

        await prisma.contact.update({
          where: { id: sendLog.contactId },
          data: { status: "geopend" },
        });
      }
    }
  } catch (error) {
    console.error("Track open error:", error);
  }

  return new Response(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}