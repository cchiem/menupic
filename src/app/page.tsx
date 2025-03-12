"use client";

import { useState } from "react";
import { useS3Upload } from "next-s3-upload";
import Dropzone from "react-dropzone";
import Image from "next/image";
import { MenuGrid } from "./components/MenuGrid";
import { ClipLoader } from "react-spinners";

export interface MenuItem {
    name: string;
    price: string;
    description: string;
    menuImage: {
        b64_json: string;
    };
}

export default function Home() {
    const { uploadToS3 } = useS3Upload();
    const [menuUrl, setMenuUrl] = useState<string | undefined>(undefined);
    const [status, setStatus] = useState<
        "initial" | "uploading" | "parsing" | "created" | "failed"
    >("initial");
    const [parsedMenu, setParsedMenu] = useState<MenuItem[]>([]);

    const handleFileChange = async (file: File) => {
        const objectUrl = URL.createObjectURL(file);
        setStatus("uploading");
        setMenuUrl(objectUrl);

        try {
            const { url } = await uploadToS3(file);
            console.log("Successfully uploaded to S3!", url);
            setStatus("parsing");

            const res = await fetch("/api/parseMenu", {
                method: "POST",
                body: JSON.stringify({
                    menuURL: url,
                }),
            });

            const json = await res.json();
            if (json.success === "failed") {
                setStatus("failed");
                console.log(json.message);
            } else {
                setStatus("created");
                setParsedMenu(json.menu);
                console.log(json);
            }
        } catch (error) {
            console.error("Error during upload or parsing:", error);
            setStatus("failed");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        100% free and powered by{" "}
                        <span className="font-bold ml-1">AI</span>
                    </div>
                </div>

                <div className="text-center max-w-3xl mx-auto mb-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
                        Visualize your menu with AI
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Take a picture of your menu and get pictures of each
                        dish, helping you make better decisions when ordering.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-10">
                    {status === "initial" && (
                        <Dropzone
                            accept={{
                                "image/*": [".jpg", ".jpeg", ".png"],
                            }}
                            multiple={false}
                            onDrop={(acceptedFiles) =>
                                handleFileChange(acceptedFiles[0])
                            }
                            minSize={1024}
                            maxSize={3072000}
                        >
                            {({
                                getRootProps,
                                getInputProps,
                                isDragAccept,
                            }) => (
                                <div
                                    className={`border-2 border-dashed p-8 rounded-[--radius-lg] flex flex-col items-center justify-center transition-all ${
                                        isDragAccept
                                            ? "border-primary bg-primary/5"
                                            : "border-border"
                                    }`}
                                    {...getRootProps()}
                                >
                                    <input {...getInputProps()} />

                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="h-10 w-10 text-muted-foreground"
                                        >
                                            <rect
                                                width="18"
                                                height="18"
                                                x="3"
                                                y="3"
                                                rx="2"
                                                ry="2"
                                            />
                                            <circle cx="9" cy="9" r="2" />
                                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                        </svg>
                                    </div>

                                    <h3 className="text-xl font-medium mb-2">
                                        Upload your menu
                                    </h3>
                                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                                        Drag and drop your menu image here, or
                                        use one of the options below
                                    </p>

                                    <div className="flex flex-wrap gap-3 justify-center">
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-[--radius] bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line
                                                    x1="12"
                                                    x2="12"
                                                    y1="3"
                                                    y2="15"
                                                />
                                            </svg>
                                            <span>Upload Image</span>
                                        </button>

                                        <button className="flex items-center gap-2 px-4 py-2 rounded-[--radius] border border-border bg-background text-foreground font-medium hover:bg-secondary">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="h-4 w-4"
                                            >
                                                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                                                <circle cx="12" cy="13" r="3" />
                                            </svg>
                                            <span>Take a Picture</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Dropzone>
                    )}

                    {menuUrl && status !== "initial" && (
                        <div className="my-10 mx-auto flex flex-col items-center">
                            <div className="p-4 border border-border rounded-[--radius-lg] shadow-md bg-card">
                                <div className="font-medium text-center mb-2">
                                    Uploaded Menu
                                </div>
                                <Image
                                    width={400}
                                    height={400}
                                    src={menuUrl || "/placeholder.svg"}
                                    alt="Menu"
                                    className="rounded-[--radius] object-contain max-h-[400px] w-auto"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="max-w-5xl mx-auto">
                    {status === "parsing" && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <ClipLoader
                                color="var(--primary)"
                                loading={status === "parsing"}
                                size={60}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                            <p className="mt-4 text-muted-foreground">
                                Analyzing your menu with AI...
                            </p>
                        </div>
                    )}

                    {status === "failed" && (
                        <div className="p-6 border border-destructive bg-destructive/5 rounded-[--radius-lg] text-center">
                            <h3 className="text-xl font-medium mb-2 text-destructive">
                                Processing Failed
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                We couldn't process your menu image. Please try
                                again with a clearer image.
                            </p>
                            <button
                                onClick={() => setStatus("initial")}
                                className="flex items-center gap-2 px-4 py-2 mx-auto rounded-[--radius] border border-border bg-background text-foreground font-medium hover:bg-secondary"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M16 12l-4 4-4-4M12 8v7" />
                                </svg>
                                <span>Try Again</span>
                            </button>
                        </div>
                    )}

                    {parsedMenu.length > 0 && (
                        <div className="mt-10">
                            <div className="flex items-center gap-3 mb-6">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-8 w-8 text-primary"
                                >
                                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                                    <path d="M7 2v20" />
                                    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                                </svg>
                                <h2 className="text-3xl font-bold">
                                    Menu – {parsedMenu.length} dishes detected
                                </h2>
                            </div>
                            <MenuGrid items={parsedMenu} />
                        </div>
                    )}
                </div>

                {status === "initial" && (
                    <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 border border-border rounded-[--radius-lg] bg-card flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 text-primary"
                                >
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" x2="12" y1="3" y2="15" />
                                </svg>
                            </div>
                            <h3 className="font-medium mb-2">Upload Menu</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload a photo of any restaurant menu
                            </p>
                        </div>

                        <div className="p-6 border border-border rounded-[--radius-lg] bg-card flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 text-primary"
                                >
                                    <rect
                                        width="18"
                                        height="18"
                                        x="3"
                                        y="3"
                                        rx="2"
                                        ry="2"
                                    />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                            </div>
                            <h3 className="font-medium mb-2">AI Processing</h3>
                            <p className="text-sm text-muted-foreground">
                                Our AI identifies and visualizes each dish
                            </p>
                        </div>

                        <div className="p-6 border border-border rounded-[--radius-lg] bg-card flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 text-primary"
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                            <h3 className="font-medium mb-2">Make Decisions</h3>
                            <p className="text-sm text-muted-foreground">
                                See what you'll get before you order
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <footer className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} PicMenu.co — Helping you visualize
                your food choices
            </footer>
        </div>
    );
}
