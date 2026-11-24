import type { SelectOptionSection } from "@/types";

export const concertTimespanOptions : SelectOptionSection[] = [
    {
          options: [
            { label: "No past concerts", value: "0" },
            { label: "1 month", value: "1" },
            { label: "3 months", value: "3" },
            { label: "6 months", value: "6" },
            { label: "1 year", value: "12" },
            { label: "All past concerts", value: "all" },
        ],
        },
]
