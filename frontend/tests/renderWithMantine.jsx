import { render as renderView } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";

export function render(ui, options = {}) {
  const Wrapper = options.wrapper;
  function Providers({ children }) {
    return <MantineProvider env="test">{Wrapper ? <Wrapper>{children}</Wrapper> : children}</MantineProvider>;
  }
  return renderView(ui, { ...options, wrapper: Providers });
}
