import { useId } from "react";

/** Immediate, texture-free counterpart of the optional spatial illustration. */
export default function CameraPoster() {
  const id = useId().replace(/:/g, "");
  const fill = (name: string) => `url(#${id}-${name})`;

  return (
    <svg
      viewBox="0 0 760 650"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`${id}-body`}
          x1="370"
          y1="125"
          x2="432"
          y2="343"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F8FCFF" />
          <stop offset="0.4" stopColor="#DCE5EE" />
          <stop offset="0.77" stopColor="#8EA4B9" />
          <stop offset="1" stopColor="#D8E4EF" />
        </linearGradient>
        <linearGradient
          id={`${id}-hood`}
          x1="295"
          y1="164"
          x2="334"
          y2="350"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFFFFF" />
          <stop offset="0.5" stopColor="#CDDCE9" />
          <stop offset="1" stopColor="#677F96" />
        </linearGradient>
        <linearGradient
          id={`${id}-mount`}
          x1="420"
          y1="322"
          x2="468"
          y2="472"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D5E2EC" />
          <stop offset="0.5" stopColor="#708CA4" />
          <stop offset="1" stopColor="#DCE5EE" />
        </linearGradient>
        <radialGradient
          id={`${id}-lens`}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(293 259) rotate(79) scale(77 64)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#174A6A" />
          <stop offset="0.4" stopColor="#112F51" />
          <stop offset="0.76" stopColor="#030B18" />
          <stop offset="1" stopColor="#24425A" />
        </radialGradient>
        <linearGradient
          id={`${id}-glass`}
          x1="276"
          y1="218"
          x2="319"
          y2="283"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A1E8FF" stopOpacity="0.8" />
          <stop offset="0.4" stopColor="#2784BA" stopOpacity="0.12" />
          <stop offset="1" stopColor="#3481A7" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient
          id={`${id}-beam`}
          x1="299"
          y1="293"
          x2="280"
          y2="540"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#73D6FF" stopOpacity="0.19" />
          <stop offset="1" stopColor="#73D6FF" stopOpacity="0.01" />
        </linearGradient>
        <radialGradient
          id={`${id}-halo`}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(399 278) rotate(90) scale(237 282)"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#247EAC" stopOpacity="0.2" />
          <stop offset="1" stopColor="#247EAC" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="399" cy="278" rx="282" ry="237" fill={fill("halo")} />
      <g stroke="#73D6FF" strokeOpacity="0.1" strokeWidth="0.8">
        <path d="M53 490 370 332 720 493 400 648 53 490Z" />
        <path d="m99 468 347 159m-298-183 347 159m-298-183 347 159m-298-183 347 159m-297-183 346 159m-297-183 346 159" />
        <path d="m100 512 317-158M150 536 467 378M200 559 517 401M250 582 567 424M300 605 617 447M350 628 667 470" />
      </g>
      <g stroke="#8CACCA" strokeOpacity="0.22" strokeWidth="1">
        <path d="m482 441 68-32 74 34v-104l-74-34-68 32v104Zm0-104 74 34 68-32m-68 32v104" />
        <path d="m561 468 51-24 54 26v-66l-54-26-51 24v66Zm0-66 54 26 51-24m-51 24v66" />
        <path d="m128 476 64-31 72 33v-57l-72-33-64 31v57Zm0-57 72 33 64-31m-64 31v57" />
        <path d="m495 354 14 7m13 6 14 7m-41-3 14 7m13 6 14 7m-41-3 14 7m13 6 14 7m-41-3 14 7m13 6 14 7" />
      </g>
      <ellipse cx="400" cy="466" rx="126" ry="32" fill="#020D1E" fillOpacity="0.3" />
      <g stroke="#73D6FF" strokeWidth="1">
        <path
          d="m299 279-175 245 247 66 164-131-236-180Z"
          fill={fill("beam")}
          strokeOpacity="0.19"
        />
        <path d="m299 279 72 311m-247-66 411-65" strokeOpacity="0.09" />
        <ellipse
          cx="354"
          cy="494"
          rx="186"
          ry="79"
          transform="rotate(-9 354 494)"
          strokeOpacity="0.12"
        />
        <ellipse
          cx="354"
          cy="494"
          rx="126"
          ry="52"
          transform="rotate(-9 354 494)"
          strokeOpacity="0.12"
        />
      </g>
      <g>
        <path d="m397 317 44-17 15 102-34 19-25-104Z" fill={fill("mount")} />
        <path d="m421 389 31-5 25 53-30 21-26-69Z" fill={fill("mount")} />
        <ellipse
          cx="453"
          cy="448"
          rx="55"
          ry="24"
          fill="#819BB1"
          stroke="#C0D4E5"
          strokeWidth="1.5"
        />
        <ellipse cx="453" cy="442" rx="55" ry="24" fill={fill("hood")} />
        <ellipse
          cx="453"
          cy="440"
          rx="38"
          ry="14"
          fill="#8BA3B8"
          fillOpacity="0.3"
          stroke="#E4EEF6"
          strokeOpacity="0.5"
        />
        <circle cx="407" cy="324" r="21" fill="#A3B9CA" stroke="#E6F0F6" strokeWidth="2" />
        <circle cx="407" cy="324" r="9" fill="#5B7891" stroke="#B7CFDF" strokeWidth="2" />
      </g>
      <g>
        <path
          d="M315 165 463 133c44-9 87 25 99 79 12 55-9 102-51 113l-156 41-40-201Z"
          fill={fill("body")}
          stroke="#E7F2FB"
          strokeOpacity="0.65"
          strokeWidth="1.5"
        />
        <path
          d="m341 167 128-27c34-7 65 15 80 53"
          stroke="white"
          strokeOpacity="0.7"
          strokeWidth="2"
        />
        <path
          d="m360 347 145-38c29-8 46-35 46-67"
          stroke="#4A647E"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <path d="m498 149 17 170" stroke="#526C84" strokeOpacity="0.4" strokeWidth="1" />
        <path
          d="m426 176 42-9m-40 16 42-9m-40 16 42-9"
          stroke="#728CA4"
          strokeOpacity="0.6"
          strokeWidth="2"
        />
        <ellipse
          cx="331"
          cy="267"
          rx="87"
          ry="103"
          transform="rotate(-13 331 267)"
          fill={fill("hood")}
          stroke="#F1F8FD"
          strokeWidth="2"
        />
        <ellipse
          cx="323"
          cy="270"
          rx="73"
          ry="88"
          transform="rotate(-13 323 270)"
          fill="#102336"
          stroke="#829CB1"
          strokeWidth="3"
        />
        <ellipse
          cx="316"
          cy="270"
          rx="62"
          ry="77"
          transform="rotate(-13 316 270)"
          fill="#071220"
          stroke="#263E52"
          strokeWidth="7"
        />
        <ellipse
          cx="308"
          cy="270"
          rx="51"
          ry="64"
          transform="rotate(-13 308 270)"
          fill={fill("lens")}
          stroke="#6D93AC"
          strokeWidth="1"
        />
        <ellipse
          cx="306"
          cy="269"
          rx="40"
          ry="51"
          transform="rotate(-13 306 269)"
          stroke="#6CC1E9"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <ellipse
          cx="304"
          cy="268"
          rx="26"
          ry="34"
          transform="rotate(-13 304 268)"
          fill="#030E1D"
          stroke="#286688"
          strokeWidth="2"
        />
        <path d="M272 244c6-23 25-36 43-30-17 1-29 16-31 39l-12-9Z" fill={fill("glass")} />
        <ellipse cx="303" cy="271" rx="9" ry="13" transform="rotate(-13 303 271)" fill="#163A56" />
        <ellipse
          cx="325"
          cy="299"
          rx="9"
          ry="15"
          transform="rotate(20 325 299)"
          fill="#73D6FF"
          fillOpacity="0.12"
        />
        <g fill="#6E879C" stroke="#B8CDDA" strokeWidth="0.75">
          <ellipse cx="294" cy="201" rx="5" ry="6" />
          <ellipse cx="350" cy="210" rx="5" ry="6" />
          <ellipse cx="377" cy="258" rx="5" ry="6" />
          <ellipse cx="357" cy="318" rx="5" ry="6" />
          <ellipse cx="301" cy="339" rx="5" ry="6" />
          <ellipse cx="268" cy="295" rx="5" ry="6" />
        </g>
        <ellipse cx="363" cy="290" rx="3" ry="4" fill="#73D6FF" fillOpacity="0.85" />
      </g>
      <g stroke="#73D6FF" strokeOpacity="0.5" strokeWidth="1">
        <path d="M195 144h-17v17m391 125h17v-17M120 365v12h12m489 157h12v-12" />
        <path d="M227 135 254 129m315 244 27-8" strokeOpacity="0.25" />
        <circle cx="171" cy="426" r="3" fill="#73D6FF" fillOpacity="0.5" />
        <circle cx="594" cy="503" r="3" fill="#73D6FF" fillOpacity="0.35" />
      </g>
    </svg>
  );
}
