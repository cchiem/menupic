"use client";
import React, { useState } from "react";
import { useS3Upload } from "next-s3-upload";
import Dropzone from "react-dropzone";
import { MagnifyingGlassIcon, PhotoIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Input from "./components/Input";
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

const Home = () => {
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
        if (json.success == "failed") {
            setStatus("failed");
            console.log(json.message);
        } else {
            setStatus("created");
            setParsedMenu(json.menu);
            console.log(json);
        }
    };

    return (
        <div className="mx-auto">
            <h1 className="text-3xl">{status}</h1>

            <div className="max-w-2xl mx-auto">
                {status == "initial" && (
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
                        {({ getRootProps, getInputProps, isDragAccept }) => (
                            <div
                                className={`mt-2 flex aspect-video cursor-pointer items-center justify-center rounded-lg border-2 border-dashed ${
                                    isDragAccept
                                        ? "border-blue-500"
                                        : "border-gray-300"
                                }`}
                                {...getRootProps()}
                            >
                                <input {...getInputProps()} />
                                <div className="text-center">
                                    <PhotoIcon
                                        className="mx-auto h-12 w-12 text-gray-300"
                                        aria-hidden="true"
                                    />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative rounded-md bg-white font-semibold text-gray-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-gray-600"
                                        >
                                            <p className="text-xl">
                                                Upload your menu
                                            </p>
                                            <p className="mt-1 font-normal text-gray-600">
                                                or take a picture
                                            </p>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Dropzone>
                )}
                {menuUrl && (
                    <div className="my-10 mx-auto flex flex-col items-center">
                        <Image
                            width={300}
                            height={300}
                            src={menuUrl}
                            alt="Menu"
                            className="rounded-lg shadow-md border-2 border-black"
                        />
                    </div>
                )}
            </div>
            <div className="max-w-5xl mx-auto">
                {status == "parsing" && (
                    <ClipLoader
                        loading={status == "parsing"}
                        size={150}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                )}
                {parsedMenu.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-4xl font-bold mb-5">
                            Menu – {parsedMenu.length} dishes detected
                        </h2>
                        <MenuGrid items={parsedMenu} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
