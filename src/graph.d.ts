interface LineParams {
    color: string;
    id: number;
    name: string;
    on: boolean;
    points: Point[];
    inspectMode: 'x' | 'y' | 'point';
}
export interface Point {
    x: number | undefined;
    y: number | undefined;
    connect: boolean;
    selected: boolean;
    debug: number;
}
export declare class Graph {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    private lines;
    private idCounter;
    private moving;
    private inspecting;
    private evCache;
    private evPrevCache;
    private lastDistance;
    private scaleXAxis;
    private scaleYAxis;
    private resizeObserver;
    height: number;
    width: number;
    xOffset: number;
    yOffset: number;
    xScale: number;
    yScale: number;
    scrollSensitivity: number;
    onRequestData: () => void;
    options: {
        grid: boolean;
        minorGrid: boolean;
        gridColor: string;
        gridResolution: number;
        axisNumbers: boolean;
        axisColor: string;
        axisActiveColor: string;
        background: string;
        controlButtons: boolean;
        lineWidth: number;
        minZoom: number;
        maxZoom: number;
    };
    prevX: number;
    prevY: number;
    private oldpt;
    constructor(canvas: HTMLCanvasElement);
    /**
     * Adds a new line to the graph (you have to call attachFn() or attachArray() function to actually draw something)
     * @param name Name of the line (displayed in tooltip)
     * @param color Line color in a CSS-compatible string
     * @returns Returns the new line's unique ID
     */
    addLine(name: string, color?: string): number;
    /**
     * Removes a line from graph
     * @param id Id of the line to be removed
     */
    removeLine(id: number): void;
    getLine(id: number): LineParams;
    attachData(id: number, array: Point[]): void;
    setInspectMode(id: number, mode: 'x' | 'y' | 'point'): void;
    zoomIn(): void;
    zoomOut(): void;
    resetZoom(): void;
    fixSize(): void;
    draw(requestRecalculation?: boolean): void;
    private getTouchDistance;
    private getTouchCenter;
    private isPointOnAxis;
    private isPointOnLine;
    private findClosestPoint;
    private drawGrid;
    private getGridScale;
    private getGridOffset;
    private drawAxes;
    private drawText;
    private toSup;
    private convert;
    private onPointerDown;
    private onPointerUp;
    private onPointerMove;
    private drawLines;
    private move;
    private zoom;
}
export {};
