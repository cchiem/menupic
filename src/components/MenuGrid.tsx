import type React from "react";
import type { MenuItem } from "@/app/page";
import Image from "next/image";

interface MenuGridProps {
    items: MenuItem[];
}

export const MenuGrid: React.FC<MenuGridProps> = ({ items }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="p-4 border border-border rounded-sm bg-card"
                >
                    <div className="flex flex-col h-full">
                        <div className="relative w-full h-48 mb-4">
                            {item.menuImage?.b64_json ? (
                                <Image
                                    src={`data:image/jpeg;base64,${item.menuImage.b64_json}`}
                                    alt={item.name}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-[--radius]"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted rounded-[--radius] flex items-center justify-center">
                                    No Image
                                </div>
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
                                ${item.price}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
