import { RequestHandler } from 'express';
import Province from '@/models/portals/locations/Province';
import District from '@/models/portals/locations/District';
import Ward from '@/models/portals/locations/Ward';
import { sendSuccessResponse } from '@/utils/http/res.response';
import { sendErrorResponse } from '@/utils/http/errors.response';
import { asyncHandler } from '@/utils/asyncHandler';

class LocationController {

    public sync: RequestHandler = asyncHandler(async (req, res) => {
        console.log('Starting Location Sync...');
        const response = await fetch('https://provinces.open-api.vn/api/?depth=3');
        if (!response.ok) {
            throw new Error('Failed to fetch data from Open API');
        }
        const data = await response.json();
        
        // ... bulk write operations omitted for brevity if mostly unchanged logic, 
        // but assuming we keep full logic here to ensure functionality persists.
        // Actually, let's keep the full logic.
        
        let provinceOps = [];
        let districtOps = [];
        let wardOps = [];

        for (const p of data) {
            provinceOps.push({
                updateOne: {
                    filter: { code: p.code },
                    update: { $set: { name: p.name, division_type: p.division_type, codename: p.codename, phone_code: p.phone_code } },
                    upsert: true
                }
            });

            if (p.districts) {
                for (const d of p.districts) {
                    districtOps.push({
                        updateOne: {
                            filter: { code: d.code },
                            update: { $set: { name: d.name, division_type: d.division_type, codename: d.codename, province_code: p.code } },
                            upsert: true
                        }
                    });

                    if (d.wards) {
                        for (const w of d.wards) {
                            wardOps.push({
                                updateOne: {
                                    filter: { code: w.code },
                                    update: { $set: { name: w.name, division_type: w.division_type, codename: w.codename, district_code: d.code } },
                                    upsert: true
                                }
                            });
                        }
                    }
                }
            }
        }

        if (provinceOps.length) await Province.bulkWrite(provinceOps as any);
        if (districtOps.length) await District.bulkWrite(districtOps as any);
        const chunkSize = 1000;
        for (let i = 0; i < wardOps.length; i += chunkSize) {
            await Ward.bulkWrite(wardOps.slice(i, i + chunkSize) as any);
        }

        return sendSuccessResponse({ res, message: `Synced successfully: ${provinceOps.length} Provinces, ${districtOps.length} Districts, ${wardOps.length} Wards` });
    });

    public getProvinces: RequestHandler = asyncHandler(async (req, res) => {
        const provinces = await Province.find().sort({ code: 1 });
        return sendSuccessResponse({ res, message: 'Provinces fetched', data: provinces });
    });

    public getDistricts: RequestHandler = asyncHandler(async (req, res) => {
        const { provinceCode } = req.params;
        const districts = await District.find({ province_code: Number(provinceCode) }).sort({ code: 1 });
        return sendSuccessResponse({ res, message: 'Districts fetched', data: districts });
    });

    public getWards: RequestHandler = asyncHandler(async (req, res) => {
        const { districtCode } = req.params;
        const wards = await Ward.find({ district_code: Number(districtCode) }).sort({ code: 1 });
        return sendSuccessResponse({ res, message: 'Wards fetched', data: wards });
    });
}

export default new LocationController();
