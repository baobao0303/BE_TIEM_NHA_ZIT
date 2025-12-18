import { RequestHandler } from 'express';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { asyncHandler } from '@/utils/asyncHandler';

class HolidayController {
    // Get public holidays
    public getHolidays: RequestHandler = asyncHandler(async (req, res) => {
        const year = Number(req.query.year) || new Date().getFullYear();
        const countryCode = (req.query.countryCode as string) || 'VN';

        try {
            const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch holidays: ${response.statusText}`);
            }

            let holidays = await response.json();

            // Augment with Lunar Holidays for Vietnam (2025)
            if (countryCode === 'VN' && year === 2025) {
                const lunarHolidays = [
                    // Lunar New Year (Tet) - Jan 25 to Feb 2
                    {
                        date: "2025-01-25", localName: "Nghỉ Tết Âm Lịch (26 Tết)", name: "Tet Holiday", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    {
                        date: "2025-01-26", localName: "Nghỉ Tết Âm Lịch (27 Tết)", name: "Tet Holiday", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    {
                        date: "2025-01-27", localName: "Nghỉ Tết Âm Lịch (28 Tết)", name: "Tet Holiday", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    {
                        date: "2025-01-28", localName: "Nghỉ Tết Âm Lịch (29 Tết)", name: "Tet Holiday", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    {
                        date: "2025-01-29", localName: "Mùng 1 Tết Âm Lịch", name: "Lunar New Year", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    {
                        date: "2025-01-30", localName: "Mùng 2 Tết Âm Lịch", name: "Lunar New Year", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    {
                        date: "2025-01-31", localName: "Mùng 3 Tết Âm Lịch", name: "Lunar New Year", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    {
                        date: "2025-02-01", localName: "Nghỉ Tết Âm Lịch (Mùng 4)", name: "Tet Holiday", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    {
                        date: "2025-02-02", localName: "Nghỉ Tết Âm Lịch (Mùng 5)", name: "Tet Holiday", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    },
                    // Hung Kings Commemoration Day - April 7
                    {
                        date: "2025-04-07", localName: "Giỗ Tổ Hùng Vương", name: "Hung Kings Commemoration Day", countryCode: "VN", fixed: false, global: true, types: ["Public"]
                    }
                ];
                
                // Merge and filter duplicates
                holidays = [...holidays, ...lunarHolidays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            }

            return sendSuccessResponse({ res, message: 'Holidays fetched successfully', data: holidays });
        } catch (error: any) {
            return sendErrorResponse({ res, message: error.message || 'Error fetching holidays', status: 500 });
        }
    });
}

export default new HolidayController();
