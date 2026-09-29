    import type { NextApiRequest, NextApiResponse } from "next";

    export default function handler(req: NextApiRequest, res: NextApiResponse) {
        if (req.method !== "POST") {
            return res.status(405).json({ message: "Method not allowed" });
        }

        const { items = [] } = req.body ?? {};
        const totalItems = Array.isArray(items)
            ? items.reduce((sum: number, item: { qty?: number }) => sum + Number(item.qty ?? 0), 0)
            : 0;

        return res.status(200).json({
            message: "Checkout preview berhasil dibuat.",
            totalItems,
        });
    }
