"use client";

import React from "react";
import ShareButtons from "./share";

interface Props {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export default function ShareClient(props: Props) {
  return <ShareButtons {...props} />;
}
