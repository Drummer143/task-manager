import React from "react";

type GridCellProps = CalendarSliceDate;

const GridCell: React.FC<GridCellProps> = ({ day }) => {

    return (
        <div
            className={"w-full min-h-[260px] aspect-square flex items-center justify-center bg-[rgb(52,52,52)]"
                .concat(" rounded cursor-pointer border border-transparent transition-[border-color]")
                .concat(" hover:border-neutral-400 active:border-white")}
        >
            {day}
        </div>
    );
};

export default GridCell;