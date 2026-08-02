import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from "react";

export { Button } from "../Button";
export { Dialog } from "../Dialog";
export { Input } from "../Input";
export { Select } from "../Select";
export { StatusMessage } from "../StatusMessage";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type PrimitiveProps<T extends ElementType> = HTMLAttributes<HTMLElement> & {
  as?: T;
  children?: ReactNode;
};

export function Surface<T extends ElementType = "section">({ as, className, ...props }: PrimitiveProps<T>) {
  return createElement(as ?? "section", { className: cx("surface card", className), ...props });
}

export function PageHeader({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return createElement("header", { className: cx("page-header page-head", className), ...props });
}

export function MetricCard({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return createElement("article", { className: cx("metric-card metric", className), ...props });
}

export function Toolbar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return createElement("div", { className: cx("toolbar actions", className), ...props });
}

export function TableFrame({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return createElement("div", { className: cx("table-wrap table-frame", className), ...props });
}

export function EmptyState({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return createElement("section", { className: cx("empty-state", className), ...props });
}

export function LoadingState({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return createElement("div", { className: cx("skeleton-block loading-state", className), ...props });
}

export function StatusChip({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return createElement("span", { className: cx("type-pill status-chip", className), ...props });
}
