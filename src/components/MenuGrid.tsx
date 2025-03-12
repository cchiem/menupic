import type React from "react";
import Image from "next/image";
import { MenuItem, SampleMenuItem } from "@/lib/types";

interface MenuGridProps {
    items: (MenuItem | SampleMenuItem)[];
}

export const MenuGrid = ({ items }: MenuGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="p-4 border border-border rounded-sm bg-card"
                >
                    <div className="flex flex-col h-full">
                        <div className="relative w-full h-48 mb-4">
                            {typeof item.menuImage === "object" &&
                            "b64_json" in item.menuImage ? (
                                <Image
                                    src={`data:image/jpeg;base64,${item.menuImage.b64_json}`}
                                    alt={item.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-[--radius]"
                                />
                            ) : (
                                <Image
                                    src={item.menuImage as string}
                                    alt={item.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-[--radius]"
                                />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                            {item.name}
                        </h3>
                        <p className="text-muted-foreground mb-2">
                            {item.description}
                        </p>
                        <div className="mt-auto">
                            <span className="text-primary font-medium">
                                {item.price}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
