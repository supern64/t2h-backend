-- CreateTable
CREATE TABLE "FreeFormAnswer" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,

    CONSTRAINT "FreeFormAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FreeFormAnswer" ADD CONSTRAINT "FreeFormAnswer_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
