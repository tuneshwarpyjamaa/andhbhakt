import { Router, type IRouter } from "express";
import { db, contentDocumentsTable, contentFilesTable } from "@workspace/db";
import { eq, like, or } from "drizzle-orm";

const router: IRouter = Router();

async function sendDocument(res: { status: (n: number) => { json: (v: unknown) => void }; json: (v: unknown) => void }, key: string): Promise<boolean> {
  const [row] = await db
    .select({ payload: contentDocumentsTable.payload })
    .from(contentDocumentsTable)
    .where(eq(contentDocumentsTable.key, key))
    .limit(1);
  if (!row) return false;
  res.json(row.payload);
  return true;
}

async function sendFileJson(res: { status: (n: number) => { json: (v: unknown) => void }; json: (v: unknown) => void }, suffix: string): Promise<boolean> {
  const [row] = await db
    .select({ content: contentFilesTable.content })
    .from(contentFilesTable)
    .where(
      or(
        like(contentFilesTable.path, `%/${suffix}`),
        eq(contentFilesTable.path, suffix),
      ),
    )
    .limit(1);
  if (!row) return false;
  res.json(JSON.parse(row.content));
  return true;
}

router.get("/content/:key", async (req, res): Promise<void> => {
  const key = req.params.key;
  if (await sendDocument(res, key)) return;
  res.status(404).json({ error: "not found", key });
});

router.get("/static/cag-reports/index.json", async (_req, res): Promise<void> => {
  if (await sendDocument(res, "cag-index")) return;
  res.status(404).json({ error: "cag index not found" });
});

router.get("/static/cag-reports/hi-index.json", async (_req, res): Promise<void> => {
  if (await sendDocument(res, "cag-hi-index")) return;
  res.status(404).json({ error: "cag hi index not found" });
});

router.get("/static/cag-reports/full/:id", async (req, res): Promise<void> => {
  const id = req.params.id.replace(/\.json$/i, "");
  if (await sendDocument(res, `cag-report:${id}`)) return;
  res.status(404).json({ error: "report not found", id });
});

router.get("/static/cag-reports/hi/:id", async (req, res): Promise<void> => {
  const id = req.params.id.replace(/\.json$/i, "");
  if (await sendDocument(res, `cag-report-hi:${id}`)) return;
  res.status(404).json({ error: "report hi not found", id });
});

router.get("/static/state-facts/index.json", async (_req, res): Promise<void> => {
  if (await sendDocument(res, "state-facts-index")) return;
  res.status(404).json({ error: "state facts index not found" });
});

router.get("/static/state-facts/:code", async (req, res): Promise<void> => {
  const code = req.params.code.replace(/\.json$/i, "").toUpperCase();
  if (await sendDocument(res, `state-fact:${code}`)) return;
  res.status(404).json({ error: "state fact not found", code });
});

router.get("/static/json/:name", async (req, res): Promise<void> => {
  const name = req.params.name.replace(/\.json$/i, "");
  if (await sendDocument(res, `json:${name}`)) return;
  if (await sendFileJson(res, `${name}.json`)) return;
  res.status(404).json({ error: "json not found", name });
});

export default router;
