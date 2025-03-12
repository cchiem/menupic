"use client";
import { useState } from "react";
import { useS3Upload } from "next-s3-upload";
import Dropzone from "react-dropzone";
import Image from "next/image";
import { ClipLoader } from "react-spinners";
import { MenuGrid } from "@/components/MenuGrid";
import {
    ImageIcon,
    Github,
    Upload,
    Camera,
    ChevronRight,
    ArrowDownCircle,
    Utensils,
} from "lucide-react";
import { BiLogoLinkedin } from "react-icons/bi";
import { CiForkAndKnife } from "react-icons/ci";

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
            if (res.ok) {
                setStatus("created");
                setParsedMenu(json.menu);
            }
        } catch (error) {
            console.error("Error during upload or parsing:", error);
            setStatus("failed");
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient overlay */}

                {/* Food image decorations */}
                <div className="absolute top-20 right-[5%] w-40 h-100 overflow-hidden opacity-80 rotate-6 blur-sm hidden md:block">
                    <Image
                        src="/menu.jpg"
                        alt="Food decoration"
                        width={160}
                        height={160}
                        className="object-cover"
                    />
                </div>
                <div className="absolute bottom-40 left-[10%] w-32 h-100 overflow-hidden opacity-80 -rotate-12 blur-sm hidden md:block">
                    <Image
                        src="/menu.jpg"
                        alt="Food decoration"
                        width={128}
                        height={128}
                        className="object-cover"
                    />
                </div>
                <div className="absolute top-1/2 left-[60%] w-36 h-100 overflow-hidden opacity-80 rotate-12 blur-sm hidden md:block">
                    <Image
                        src="/menu.jpg"
                        alt="Food decoration"
                        width={144}
                        height={144}
                        className="object-cover"
                    />
                </div>
            </div>
            <header className="container mx-auto py-4 px-4 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-card p-1.5 rounded-full shadow-sm">
                        <CiForkAndKnife className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold">SnapMenu</h1>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2">
                    <a
                        href="https://www.linkedin.com/in/chris-chiem-uoa/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
                        aria-label="LinkedIn"
                    >
                        <BiLogoLinkedin size={20} />
                    </a>

                    <a
                        href="https://github.com/cchiem"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-colors"
                        aria-label="GitHub"
                    >
                        <Github className="h-5 w-5 text-primary" />
                    </a>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8 relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm text-primary text-sm font-medium shadow-sm">
                        100% free and powered by
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
                                    className={`border-2 border-dashed p-8 rounded-[2rem] flex flex-col items-center justify-center transition-all shadow-lg bg-card/80 backdrop-blur-sm ${
                                        isDragAccept
                                            ? "border-primary bg-primary/5"
                                            : "border-border"
                                    }`}
                                    {...getRootProps()}
                                >
                                    <input {...getInputProps()} />

                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6 shadow-inner">
                                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                    </div>

                                    <h3 className="text-xl font-medium mb-2">
                                        Upload your menu
                                    </h3>
                                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                                        Drag and drop your menu image here, or
                                        use one of the options below
                                    </p>

                                    <div className="flex flex-wrap gap-3 justify-center">
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-[--radius-xl] bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-md transition-all">
                                            <Upload className="h-4 w-4" />
                                            <span>Upload Image</span>
                                        </button>

                                        <button className="flex items-center gap-2 px-4 py-2 rounded-[--radius-xl] border border-border bg-card text-foreground font-medium hover:bg-secondary shadow-md transition-all">
                                            <Camera className="h-4 w-4" />
                                            <span>Take a Picture</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </Dropzone>
                    )}

                    {menuUrl && status !== "initial" && (
                        <div className="my-10 mx-auto flex flex-col items-center">
                            <div className="p-4 border border-border rounded-[2rem] shadow-lg bg-card/80 backdrop-blur-sm">
                                <div className="font-medium text-center mb-2">
                                    Uploaded Menu
                                </div>
                                <Image
                                    width={400}
                                    height={400}
                                    src={menuUrl || "/placeholder.svg"}
                                    alt="Menu"
                                    className="rounded-[1.5rem] object-contain max-h-[400px] w-auto"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="max-w-5xl mx-auto">
                    {status === "parsing" && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="p-8 rounded-[2rem] bg-card/80 backdrop-blur-sm shadow-lg flex flex-col items-center">
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
                        </div>
                    )}

                    {status === "failed" && (
                        <div className="p-8 border border-destructive bg-destructive/5 backdrop-blur-sm rounded-[2rem] text-center shadow-lg">
                            <h3 className="text-xl font-medium mb-2 text-destructive">
                                Processing Failed
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                We couldn't process your menu image. Please try
                                again with a clearer image.
                            </p>
                            <button
                                onClick={() => setStatus("initial")}
                                className="flex items-center gap-2 px-4 py-2 mx-auto rounded-[--radius-xl] border border-border bg-card text-foreground font-medium hover:bg-secondary shadow-md transition-all"
                            >
                                <ArrowDownCircle className="h-4 w-4" />
                                <span>Try Again</span>
                            </button>
                        </div>
                    )}

                    {parsedMenu.length > 0 && (
                        <div className="mt-10">
                            <div className="flex items-center gap-3 mb-6 p-4 rounded-sm bg-card/80 backdrop-blur-sm shadow-md">
                                <Utensils className="h-8 w-8 text-primary" />
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
                        <div className="p-6 border border-border rounded-[2rem] bg-card/80 backdrop-blur-sm flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-inner">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-medium mb-2">Upload Menu</h3>
                            <p className="text-sm text-muted-foreground">
                                Upload a photo of any restaurant menu
                            </p>
                        </div>

                        <div className="p-6 border border-border rounded-[2rem] bg-card/80 backdrop-blur-sm flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-inner">
                                <ImageIcon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-medium mb-2">AI Processing</h3>
                            <p className="text-sm text-muted-foreground">
                                Our AI identifies and visualizes each dish
                            </p>
                        </div>

                        <div className="p-6 border border-border rounded-[2rem] bg-card/80 backdrop-blur-sm flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 shadow-inner">
                                <ChevronRight className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-medium mb-2">Make Decisions</h3>
                            <p className="text-sm text-muted-foreground">
                                See what you'll get before you order
                            </p>
                        </div>
                    </div>
                )}
            </main>

            <footer className="container border-t-2 border-gray-200 mx-auto py-6 px-4 text-center text-sm text-muted-foreground relative z-10">
                Created by <span className="underline">Chris Chiem</span>.
                Powered by TogetherAI
            </footer>
        </div>
    );
}
