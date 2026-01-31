"use client";

import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils/cx";

export const ClickLogoIcon = (props: HTMLAttributes<SVGElement>) => (
  <svg
    width="33"
    height="32"
    viewBox="0 0 33 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    className={cx("size-8 shrink-0", props.className)}
  >
    <path
      d="M14.5329 27.4026C13.4861 28.4545 13.4861 30.1598 14.5329 31.2118C15.5798 32.2637 17.2771 32.2637 18.324 31.2118C19.3709 30.1598 19.3709 28.4545 18.324 27.4026L16.4285 25.498L14.5329 27.4026Z"
      fill="#3E8F4A"
    />
    <path
      d="M14.3699 2.51555e-07L18.4858 3.23607e-07L18.4858 16.8655L29.239 6.05653L32.1494 8.98083L22.6017 18.5785L32.8556 18.5785L32.8556 22.7141L6.06375e-05 22.7141L6.07099e-05 18.5785L10.2539 18.5785L0.706134 8.98083L3.61652 6.05653L14.3699 16.8655L14.3699 2.51555e-07Z"
      fill="#3E8F4A"
    />
  </svg>
);

export const ClickLogo = (props: HTMLAttributes<HTMLDivElement>) => (
  <div
    {...props}
    className={cx("flex h-8 items-center gap-2", props.className)}
  >
    <ClickLogoIcon />
    <span className="text-xl text-primary">
      <span className="font-extralight">Click</span>
      <span className="font-normal">Marketing</span>
    </span>
  </div>
);
