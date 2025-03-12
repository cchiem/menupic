/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cchiem-picmenu.s3.ap-southeast-2.amazonaws.com",
                pathname: "/next-s3-uploads/**",
            },
        ],
    },
};

export default nextConfig;
