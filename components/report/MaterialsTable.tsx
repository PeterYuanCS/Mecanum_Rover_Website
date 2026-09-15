import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption } from '@/components/ui/table';
type Material = [string, string, number, string];
const car: Material[] = [
  ['Mecanum car kit', 'Metal chassis, four wheels and TT geared motors', 32, 'B0CBRBCFMZ'],
  ['L298N motor drivers', 'Four-board pack; two boards fitted', 10, 'B0C84VLLC9'],
  ['ESP32 + expansion board', 'Microcontroller and accessible terminals', 15, 'B0DFGFV3H5'],
  ['18650 battery holder', 'Holder for the rechargeable cells', 7, 'B099J82ZGL'],
  ['EFEST lithium-ion battery', 'Battery purchase as listed', 18, 'B0DXDQJ4H7'],
  ['M3 nylon mounting hardware', 'Black spacers, screws and nuts', 7, 'B09C21MS45'],
  ['Adhesive board spacers', '0.49-inch insulated supports', 8, 'B0DRYBM66Q'],
  ['HC-SR04 distance sensors', 'Ultrasonic ranging modules', 8, 'B07XF4815H'],
  ['Distance-sensor holder', 'One mounting bracket', 5, 'B01FA1JR98'],
];
const bench: Material[] = [
  ['Silicone soldering mat', 'Reusable work surface', 10, 'B08XVZTF3P'],
  ['Soldering iron kit', 'Iron and preparation tools', 17, 'B0CPDGDMD5'],
  ['Breadboard jumper wires', 'Prototyping connections', 9, 'B0BMFXPSVG'],
  ['Light sensor / learning components', 'Listed for introductory Arduino work', 6, 'B0DHX56K7J'],
  ['Male-to-female wires', 'Connections between modules', 6, 'B07GD2BWPY'],
];
function MaterialGroup({ rows, title, label }: { rows: Material[]; title: string; label: string }) {
  return <div className="materials-group"><h3>{title}</h3><Table className="report-table"><TableCaption>{label}</TableCaption><TableHeader><TableRow><TableHead scope="col">Component</TableHead><TableHead scope="col">Qty.</TableHead><TableHead scope="col">Est. £</TableHead></TableRow></TableHeader><TableBody>{rows.map(([name, description, cost, product]) => <TableRow key={name}><TableCell><a href={`https://www.amazon.co.uk/dp/${product}`} target="_blank" rel="noreferrer">{name} <span aria-hidden="true">↗</span></a><small>{description}</small></TableCell><TableCell>1</TableCell><TableCell>{cost}</TableCell></TableRow>)}</TableBody><TableFooter><TableRow><TableCell colSpan={2}>Subtotal</TableCell><TableCell>£{rows.reduce((sum, row) => sum + row[2], 0)}</TableCell></TableRow></TableFooter></Table></div>;
}
export function MaterialsTable() {
  return <div className="report-materials"><MaterialGroup rows={car} title="Car Kit Materials" label="Table 01. Rover materials from the original list." /><MaterialGroup rows={bench} title="Workbench Materials" label="Table 02. Reusable tools and learning components." /><div className="materials-total"><span>Combined Itemised Estimate</span><strong>£158</strong></div><p className="report-small">I have retained the quantities, estimated prices and product references from the original materials list, whose rounded budget is approximately £160 (£110 + £50). Note that the light-sensor entry in that list links to a component assortment (a mixed pack), so I have preserved that distinction in the table.</p></div>;
}
