import { Grid2, Skeleton } from "@mui/material";

interface Prop {
    elements: number;
}

export const SkeletonMiembro: React.FC<Prop> = ({ elements }) => {
    return (
        <>
            {
                [...Array(elements)].map((_, index) => (
                    <Grid2 size={{ xs: 12, sm: 12, md: 12 }} gap={4} key={`grid_skeleton_${index}`}>
                        <Skeleton key={index} variant="rounded" width="100%" height={75} sx={{ borderRadius: 2 }} />
                    </Grid2>
                ))
            }
        </>
    )
}