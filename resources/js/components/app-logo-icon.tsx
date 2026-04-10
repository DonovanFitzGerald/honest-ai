import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="60"
            height="69"
            viewBox="0 0 60 69"
            fill="none"
            {...props}
        >
            <path
                d="M27.6596 0L0 42.1157L60 52L27.6596 0Z"
                fill="url(#paint0_linear_125_673)"
                stroke={props.fill}
                strokeWidth="1"
            />
            <path
                d="M27.8118 0L24 69L60 51.537L27.8118 0Z"
                fill="white"
                stroke={props.fill}
                strokeWidth="1"
            />
            <defs>
                <linearGradient
                    id="paint0_linear_125_673"
                    x1="-3.29295e-07"
                    y1="44.2645"
                    x2="47.7514"
                    y2="59.8846"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stop-color="#D9D9D9" />
                    <stop offset="0.658654" stop-color={props.fill} />
                </linearGradient>
            </defs>
        </svg>
    );
}
