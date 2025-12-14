"use client";

import { CodeReviewer } from "@/components/code-review/CodeReviewer";

const MOCK_CODE = `function hello() {
  console.log("Hello World!");
  
  // This is a multi-line
  // comment to test context
  return true;
}`;

export default function CodeReviewPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Code Review Demo</h1>
      <CodeReviewer code={MOCK_CODE} language="javascript" />
    </div>
  );
}
