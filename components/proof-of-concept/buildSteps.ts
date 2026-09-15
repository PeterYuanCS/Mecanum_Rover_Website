export type BuildPhoto = { id: string; caption: string; portrait?: boolean };
export type BuildStep = {
  id: number;
  title: string;
  category: string;
  description: string;
  photos: BuildPhoto[];
};

export const buildSteps: BuildStep[] = [
  {
    id: 1,
    title: 'The First Solder Joint',
    category: 'Tools & Preparation',
    description: 'The first challenge was learning to solder (for the first time!), before the rover could take shape. We began with the motor leads (jumper wires), paying particular attention to the terminals (connection points) on each geared motor. Soldering provides a direct electrical connection, whilst the small terminals leave little room for an unsteady hand; this first stage was therefore as much about learning the tools as preparing the motors.',
    photos: [
      { id: '1', caption: 'The soldering iron and workbench at the beginning of the build.' },
      { id: '1.1', caption: 'The soldering kit, with solder, spare tips and the tools used to prepare the motor leads.' },
    ],
  },
  {
    id: 2,
    title: 'The Motor Connections',
    category: 'Soldering & Wiring',
    description: 'Next, the black and red leads were soldered to the terminals of each geared direct-current (DC) motor. The two colours make the leads easier to distinguish during assembly, whilst the exposed joints still require care when handling the motors. These close-up views record the connections before the motors were fitted to the lower metal deck (chassis).',
    photos: [
      { id: '2', caption: 'The black and red leads attached to the motor terminals.', portrait: true },
      { id: '2.1', caption: 'The geared motor and its two leads, viewed from the side.', portrait: true },
      { id: '2.2', caption: 'A closer view of the connections at the rear of the motor.', portrait: true },
      { id: '2.3', caption: 'The prepared motor before mounting it to the chassis.', portrait: true },
    ],
  },
  {
    id: 3,
    title: 'The Mecanum Wheels',
    category: 'Wheels & Drive Base',
    description: 'With the leads attached, we mounted the geared motors to the lower metal deck (chassis) and fitted the mecanum wheels (wheels with angled rollers). Their rollers allow sideways motion when the four motors are coordinated, whilst this arrangement requires the wheel orientations and motor directions to agree. The photographs follow the wheel, motor mounts and underside of the developing drive base.',
    photos: [
      { id: '3', caption: 'A mecanum wheel fitted to the drive base, with its angled rollers visible.' },
      { id: '3.1', caption: 'The wheel and geared motor mounted alongside the metal chassis.' },
      { id: '3.2', caption: 'A close-up of the motor mounting points beneath the chassis.' },
      { id: '3.3', caption: 'The motor leads passing through the lower deck.' },
      { id: '3.4', caption: 'Two geared motors mounted along one side of the chassis.' },
      { id: '3.5', caption: 'An overview of the lower deck during the wheel and motor assembly.', portrait: true },
    ],
  },
  {
    id: 4,
    title: 'The Two-Deck Chassis',
    category: 'Structure & Assembly',
    description: 'Once the drive base was assembled, we stacked a second metal deck above it, using standoffs (spacers) to separate the two levels. This arrangement creates a dedicated upper surface for the electronics, whilst access to the motors and their leads becomes more restricted after the upper deck is fitted. At this stage, the collection of parts was beginning to look like a car.',
    photos: [
      { id: '4', caption: 'The upper and lower metal decks assembled into a two-level chassis.', portrait: true },
      { id: '4.1', caption: 'A side view of the mecanum wheel beneath the upper deck.' },
      { id: '4.2', caption: 'The spacing between the decks, with the motor leads visible inside.', portrait: true },
      { id: '4.3', caption: 'The stacked chassis viewed at an angle, showing the wheel placement.', portrait: true },
      { id: '4.4', caption: 'The two-deck chassis resting on its mecanum wheels.' },
    ],
  },
  {
    id: 5,
    title: 'The Control Electronics',
    category: 'Controller & Motor Drivers',
    description: 'We then attached the two L298N motor drivers (power-switching boards), the ESP32 (microcontroller) and its expansion board to the upper metal deck. The expansion board makes the controller connections accessible, whilst fitting all three elements onto the same deck leaves limited space for routing the leads. These views document the component placement before the battery holder was added.',
    photos: [
      { id: '5', caption: 'The control electronics mounted above the drive base.', portrait: true },
      { id: '5.1', caption: 'An overhead view of the ESP32 expansion board and the two L298N motor drivers.', portrait: true },
      { id: '5.2', caption: 'A second view of the electronics and the available space on the upper deck.', portrait: true },
      { id: '5.3', caption: 'The upper-deck component layout before adding the battery holder.', portrait: true },
    ],
  },
  {
    id: 6,
    title: 'The Assembled Rover',
    category: 'Battery Holder & Walkaround',
    description: 'Finally, we attached the lithium-ion (Li-ion) battery holder to the upper metal deck, alongside the control electronics. Mounting the holder on the rover brings the power source into the assembly, whilst the remaining space must accommodate the connecting leads. Overall, these photographs record the assembled rover from several angles (a full walkaround), bringing the six stages of the physical build together.',
    photos: [
      { id: '6', caption: 'The assembled rover with its battery holder mounted on the upper deck.' },
      { id: '6.1', caption: 'A side view of the two decks, control electronics and connecting leads.' },
      { id: '6.2', caption: 'The rover viewed from the opposite corner.' },
      { id: '6.3', caption: 'An end view showing the width of the two-deck chassis.', portrait: true },
      { id: '6.4', caption: 'A three-quarter view of the assembled rover on the work mat.', portrait: true },
      { id: '6.5', caption: 'The opposite side of the rover, with both mecanum wheels visible.', portrait: true },
      { id: '6.6', caption: 'The battery-holder end of the rover, completing the walkaround.', portrait: true },
    ],
  },
];

export const photoPath = (id: string, variant = '') => `/images/build/${id}${variant ? `-${variant}` : ''}.avif`;
