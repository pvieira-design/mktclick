import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@marketingclickcannabis/auth";
import { env } from "@marketingclickcannabis/env/server";
import db from "@marketingclickcannabis/db";

export const runtime = "nodejs";
export const maxDuration = 300;

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];

const MAX_SIZE = 500 * 1024 * 1024; // 500MB

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isR2Configured = Boolean(
    env.CLOUDFLARE_ACCOUNT_ID &&
    env.CLOUDFLARE_R2_BUCKET &&
    env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  );

  if (!isR2Configured) {
    return NextResponse.json(
      { error: "Cloudflare R2 is not configured" },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only video files are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 500MB limit" },
      { status: 400 }
    );
  }

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `videos/${Date.now()}-${sanitizedName}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const publicUrl = env.CLOUDFLARE_R2_PUBLIC_URL
      ? `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`
      : `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.CLOUDFLARE_R2_BUCKET}/${key}`;

    const dbFile = await db.file.create({
      data: {
        name: file.name,
        originalName: file.name,
        description: "Uploaded video",
        url: publicUrl,
        pathname: key,
        size: file.size,
        mimeType: file.type,
        uploadedById: session.user.id,
      },
      include: {
        tags: { include: { tag: true } },
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ id: dbFile.id, url: dbFile.url });
  } catch (error) {
    console.error("R2 upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
