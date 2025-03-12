export interface MenuItem {
    name: string;
    price: string;
    description: string;
    menuImage: {
        b64_json: string;
    };
}

export interface SampleMenuItem {
    name: string;
    price: string;
    description: string;
    menuImage: string;
}
