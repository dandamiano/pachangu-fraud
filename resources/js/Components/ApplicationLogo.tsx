import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo1.png"
            alt="Application Logo"
            className={`object-contain ${className ?? ''}`}
        />
    );
}
