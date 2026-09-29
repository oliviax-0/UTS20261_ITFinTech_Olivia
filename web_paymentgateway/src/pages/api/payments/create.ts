    import type { NextApiRequest, NextApiResponse } from "next";

    export default function handler(req: NextApiRequest, res: NextApiResponse) {
        if (req.method !== "POST") {
            return res.status(405).json({ message: "Method not allowed" });
        }

        return res.status(200).json({
            id: `sim_${Date.now()}`,
            status: "created",
            note: "Endpoint ini siap diganti ke Xendit/Midtrans jika credential tersedia.",
        });
    }
