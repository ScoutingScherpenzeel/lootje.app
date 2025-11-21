type StatusChipProps = {
    children: React.ReactNode;
    icon?: React.ReactNode;
    tone?: "plain" | "success" | "neutral";
    size?: "normal" | "small";
};

export default function StatusChip({ children, icon, tone = "neutral", size = "normal" }: StatusChipProps) {
    const toneClasses = {
        neutral: "bg-black text-white",
        success: "bg-green-400 text-black",
        plain: "bg-white text-black",
    }[tone];

    const sizeClasses = {
        normal: "px-3 py-1",
        small: "px-2 py-0.5",
    }[size];

    return (
        <span className={`w-fit inline-flex items-center gap-2 border-4 text-xs font-black uppercase border-black ${toneClasses} ${sizeClasses}`}>
            {icon}
            {children}
        </span>
    );
}