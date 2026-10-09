import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);
// Same curves as --ease-out / --ease-in-out so CSS and GSAP motion feel like one system.
CustomEase.create("out", "0.23, 1, 0.32, 1");
CustomEase.create("inOut", "0.77, 0, 0.175, 1");

export { gsap, ScrollTrigger, SplitText };
