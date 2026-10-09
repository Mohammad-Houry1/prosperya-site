import { Component } from "react";

export default class CanvasErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Unable to load the 3D scene", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
