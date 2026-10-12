import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { render } from "../renderWithMantine.jsx";
import GoogleCaptcha from "../../src/components/forms/GoogleCaptcha.jsx";

afterEach(() => vi.unstubAllGlobals());

test("passes Google tokens, clears expiry/errors, and resets consumed tokens", async () => {
  const renderWidget = vi.fn(() => 7);
  const reset = vi.fn();
  vi.stubGlobal("grecaptcha", { render: renderWidget, reset });
  const onChange = vi.fn();
  const props = { siteKey: "public-key", onChange, resetKey: 0, errorText: "Verification unavailable", retryText: "Retry" };
  const view = render(<GoogleCaptcha {...props} />);
  await waitFor(() => expect(renderWidget).toHaveBeenCalledTimes(1));
  const callbacks = renderWidget.mock.calls[0][1];
  expect(callbacks.sitekey).toBe("public-key");
  act(() => callbacks.callback("google-token"));
  expect(onChange).toHaveBeenLastCalledWith("google-token");
  act(() => callbacks["expired-callback"]());
  expect(onChange).toHaveBeenLastCalledWith("");
  act(() => callbacks["error-callback"]());
  expect(screen.getByRole("alert")).toHaveTextContent("Verification unavailable");
  expect(onChange).toHaveBeenLastCalledWith("");
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  await waitFor(() => expect(renderWidget).toHaveBeenCalledTimes(2));
  view.rerender(<GoogleCaptcha {...props} resetKey={1} />);
  expect(reset).toHaveBeenCalledWith(7);
  expect(onChange).toHaveBeenLastCalledWith("");
});

test("does not mount a widget after the form has unmounted", async () => {
  vi.stubGlobal("grecaptcha", { render: vi.fn(() => 1), reset: vi.fn() });
  const view = render(<GoogleCaptcha siteKey="public-key" onChange={vi.fn()} />);
  view.unmount();
  await act(async () => {});
  expect(window.grecaptcha.render).not.toHaveBeenCalled();
});
