import React from "react";
import FailureScreen from "../components/feedback/FailureScreen.jsx";
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Prosperya render error", error, info);
  }
  render() {
    if (this.state.error) {
      const locale = window.location.pathname.split("/")[1] === "fr" ? "fr" : "en";
      return <FailureScreen locale={locale} onRetry={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}
