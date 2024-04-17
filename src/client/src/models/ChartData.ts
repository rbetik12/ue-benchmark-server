export interface Dataset {
    label: string,
    data: number[],
    fill: boolean,
    borderColor: string,
    tension: number,
}

export interface ChartData {
    labels: number[];
    datasets: Dataset[];
}