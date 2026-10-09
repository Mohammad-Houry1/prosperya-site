import { useRef } from "react";
import { SplitText } from "../gsap.js";
import { useGsapContext } from "../hooks/useGsapContext.js";

/*
  A Hero title rises line by line out of a mask as the page opens (`onLoad`).
  Every other heading renders still, so text never waits on a reveal
  (docs/adr/0001-no-repeat-rules.md). Text is never hidden without JS or under
  reduced motion: the split only happens here.
*/
export default function RevealText({
  as: Tag = "h2",
  children,
  className = "",
  onLoad = false,
  delay = 0,
  ...rest
}) {
  const ref = useRef(null);
  useGsapContext(
    ref,
    ({ gsap }) => {
      if (!onLoad) return;
      SplitText.create(ref.current, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: 1.1,
            ease: "out",
            stagger: 0.09,
            delay,
          }),
      });
    },
    [onLoad, delay],
  );
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
