"use client";
import * as React from "react";
import { useEffect } from "react";

/**
 * Placeholder component to be overridden by specific SDKs.
 * Allows to dynamically import components.
 */

type AwaiterProps = {
  load: () => Promise<any>;
  props?: any;
  attributes?: any;
  fallback?: any;
  children?: any;
};

function Awaiter(props: AwaiterProps) {
  useEffect(() => {}, []);

  return <>{props.children}</>;
}

export default Awaiter;
