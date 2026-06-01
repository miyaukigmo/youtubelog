"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud, CheckCircle, Home } from "lucide-react";
import Link from "next/link";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; error?: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      console.error("Import error:", error);
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle>Google Takeout データのインポート</CardTitle>
          <CardDescription>
            ダウンロードした <code>watch-history.json</code> ファイルを選択してアップロードしてください。最新の1000件が自動的にデータベースに登録されます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <input 
              type="file" 
              accept="application/json" 
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button 
            onClick={handleImport} 
            disabled={!file || isLoading}
            className="w-full sm:w-auto bg-primary text-primary-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                インポート中...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                履歴をインポートする
              </>
            )}
          </Button>

          {result && (
            <div className={`p-4 rounded-md mt-4 flex items-start gap-3 ${result.success ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
              {result.success ? (
                <div className="w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="font-bold">インポート成功！</p>
                  </div>
                  <p className="text-sm mb-4">{result.count} 件の動画履歴をデータベースに登録しました。</p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">
                      <Home className="w-4 h-4 mr-2" />
                      ダッシュボードに戻る
                    </Link>
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-bold">エラーが発生しました</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
