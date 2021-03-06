module powerbi.extensibility.visual.radioSlicer873FA346FEEF4794B3D9938C805B7310  {
    export class Visual implements IVisual {
        private target: HTMLElement;
        private selectionManager: ISelectionManager;
        private selectionIds: any = {};
        private host: IVisualHost;
        private isEventUpdate: boolean = false;

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.host = options.host;
            this.selectionManager = options.host.createSelectionManager();
        }

        public update(options: VisualUpdateOptions) {
            if (options.type & VisualUpdateType.Data && !this.isEventUpdate) {
                this.init(options);
            }
        }

        public init(options: VisualUpdateOptions) {

            // Return if we don't have a category
            if (!options ||
                !options.dataViews ||
                !options.dataViews[0] ||
                !options.dataViews[0].categorical ||
                !options.dataViews[0].categorical.categories ||
                !options.dataViews[0].categorical.categories[0]) {
                return;
            }

            // remove any children from previous renders
            while (this.target.firstChild) {
                this.target.removeChild(this.target.firstChild);
            }

            // clear out any previous selection ids
            this.selectionIds = {};

            // get the category data.
            let category = options.dataViews[0].categorical.categories[0];
            let values = category.values;

            // build selection ids to be used by filtering capabilities later
            values.forEach((item: number, index: number) => {

                // create an in-memory version of the selection id so it can be used in onclick event.
                this.selectionIds[item] = this.host.createSelectionIdBuilder()
                    .withCategory(category, index)
                    .createSelectionId();

                let value = item.toString();

                let radio = document.createElement("input");
                radio.type = "radio";
                radio.value = value;
                radio.name = "values";
                radio.onclick = function (ev) {
                    this.isEventUpdate = true; // This is checked in the update method. If true it won't re-render, this prevents and infinite loop
                    this.selectionManager.clear(); // Clean up previous filter before applying another one.

                    // Find the selectionId and select it
                    this.selectionManager.select(this.selectionIds[value]).then((ids: ISelectionId[]) => {
                        /*ids.forEach(function (id) {
                            console.log(id);
                        });*/
                    });

                    // This call applys the previously selected selectionId
                    this.selectionManager.applySelectionFilter();
                }.bind(this);

                let label = document.createElement("label");
                label.innerHTML += value;

                this.target.appendChild(radio);
                this.target.appendChild(label);
            })
        }
    }
}
