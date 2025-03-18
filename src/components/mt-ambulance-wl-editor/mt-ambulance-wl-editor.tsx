
import { Component, Host, Prop, State, h, EventEmitter, Event } from '@stencil/core';
import { AmbulanceWaitingListApi, AmbulanceConditionsApi, WaitingListEntry, Configuration, Condition } from '../../api/ambulance-wl';

@Component({
  tag: 'mt-ambulance-wl-editor',
  styleUrl: 'mt-ambulance-wl-editor.css',
  shadow: true,
})
export class MtAmbulanceWlEditor {
  @Prop() entryId: string;
  @Prop() ambulanceId: string;
  @Prop() apiBase: string;

  @Event({eventName: "editor-closed"}) editorClosed: EventEmitter<string>;

  @State() private duration = 15
  @State() entry: WaitingListEntry;
  @State() conditions: Condition[];
  @State() errorMessage:string;
  @State() isValid: boolean;
  
  private formElement: HTMLFormElement;

  async componentWillLoad() {
    this.getWaitingEntryAsync();
    this.getConditions();
}
private async getConditions(): Promise<Condition[]> {
  try {
    const configuration = new Configuration({
      basePath: this.apiBase,
    });

    const conditionsApi = new AmbulanceConditionsApi(configuration);

    const response = await conditionsApi.getConditionsRaw({ambulanceId: this.ambulanceId})
    if (response.raw.status < 299) {
      this.conditions = await response.value();
    }
  } catch (err: any) {
    // no strong dependency on conditions
  }
  // always have some fallback condition
  return this.conditions || [{
    code: "fallback",
    value: "Neurčený dôvod návštevy",
    typicalDurationMinutes: 15,
  }];
}

  private async getWaitingEntryAsync(): Promise<WaitingListEntry> {
      if(this.entryId === "@new") {
        this.isValid = false;
        this.entry = {
          id: "@new",
          patientId: "",
          waitingSince: new Date(Date.now()),
          estimatedDurationMinutes: 15
        };
        return this.entry;
      }
      if ( !this.entryId ) {
        this.isValid = false;
        return undefined
      }
    try {
      const configuration = new Configuration({
      basePath: this.apiBase,
      });

      const waitingListApi = new AmbulanceWaitingListApi(configuration);

      const response = await waitingListApi.getWaitingListEntryRaw({ambulanceId: this.ambulanceId, entryId: this.entryId});

      if (response.raw.status < 299) {
          this.entry = await response.value();
          this.isValid = true;
      } else {
          this.errorMessage = `Cannot retrieve list of waiting patients: ${response.raw.statusText}`
      }
    } catch (err: any) {
      this.errorMessage = `Cannot retrieve list of waiting patients: ${err.message || "unknown"}`
    }
    return undefined;
  }

  private handleSliderInput(event: Event) {
    this.duration = +(event.target as HTMLInputElement).value;
  }
  private handleInputEvent( ev: InputEvent): string {
    const target = ev.target as HTMLInputElement;
    // check validity of elements
    this.isValid = true;
    for (let i = 0; i < this.formElement.children.length; i++) {
        const element = this.formElement.children[i]
        if ("reportValidity" in element) {
        const valid = (element as HTMLInputElement).reportValidity();
        this.isValid &&= valid;
        }
    }
    return target.value
  }
  private async updateEntry() {
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });
  
      const waitingListApi = new AmbulanceWaitingListApi(configuration);
  
      const response = this.entryId == "@new" ?
      await waitingListApi.createWaitingListEntryRaw({ambulanceId: this.ambulanceId, waitingListEntry: this.entry}) :
      await waitingListApi.updateWaitingListEntryRaw({ambulanceId: this.ambulanceId, entryId: this.entryId, waitingListEntry: this.entry});

      if (response.raw.status < 299) {
        this.editorClosed.emit("store")
      } else {
        this.errorMessage = `Cannot store entry: ${response.raw.statusText}`
      }
    } catch (err: any) {
      this.errorMessage = `Cannot store entry: ${err.message || "unknown"}`
    }
  }
  private async deleteEntry() {
    try {
      const configuration = new Configuration({
        basePath: this.apiBase,
      });
  
      const waitingListApi = new AmbulanceWaitingListApi(configuration);
  
      const response = await waitingListApi.deleteWaitingListEntryRaw({ambulanceId: this.ambulanceId, entryId: this.entryId});
        if (response.raw.status < 299) {
        this.editorClosed.emit("delete")
        } else {
        this.errorMessage = `Cannot delete entry: ${response.raw.statusText}`
        }
    } catch (err: any) {
        this.errorMessage = `Cannot delete entry: ${err.message || "unknown"}`
    }
  }
  private handleCondition(ev: InputEvent) {
    if(this.entry) {
      const code = this.handleInputEvent(ev)
      const condition = this.conditions.find(condition => condition.code === code);
      this.entry.condition = Object.assign({}, condition);
      this.entry.estimatedDurationMinutes = condition.typicalDurationMinutes;
      this.duration = condition.typicalDurationMinutes;
    }
  }
  private renderConditions() {
    let conditions = this.conditions || [];
    // we want to have this.entry`s condition in the selection list
    if (this.entry?.condition) {
      const index = conditions.findIndex(condition => condition.code === this.entry.condition.code)
      if (index < 0) {
      conditions = [this.entry.condition, ...conditions]
      }
    }
    return (
      <md-filled-select label="Dôvod návštevy"
        display-text={this.entry?.condition?.value}
        oninput={(ev: InputEvent) => this.handleCondition(ev)} >
      <md-icon slot="leading-icon">sick</md-icon>
      {this.entry?.condition?.reference ?
        <md-icon slot="trailing-icon" class="link"
          onclick={()=> window.open(this.entry.condition.reference, "_blank")}>
            open_in_new
        </md-icon>
      : undefined
      }
      {conditions.map(condition => {
          return (
            <md-select-option
            value={condition.code}
            selected={condition.code === this.entry?.condition?.code}>
                <div slot="headline">{condition.value}</div>
            </md-select-option>
          )
      })}
      </md-filled-select>
    );
  }
render() {
  if(this.errorMessage) {
    return (
    <Host>
      <div class="error">{this.errorMessage}</div>
    </Host>
    )
}
  return (
    <Host>
      <form ref={el => this.formElement = el}>
      <md-filled-text-field label="Meno a Priezvisko"             
        required value={this.entry?.name}
            oninput={ (ev: InputEvent) => {
              if(this.entry) {this.entry.name = this.handleInputEvent(ev)}
            } }>
        
        <md-icon slot="leading-icon">person</md-icon>
      </md-filled-text-field>

      <md-filled-text-field label="Registračné číslo pacienta"             
        required value={this.entry?.patientId}
            oninput={ (ev: InputEvent) => {
              if(this.entry) {this.entry.patientId = this.handleInputEvent(ev)}
            } }>
        <md-icon slot="leading-icon">fingerprint</md-icon>
      </md-filled-text-field>

      <md-filled-text-field label="Čakáte od" disabled
          value={this.entry?.waitingSince}>
        <md-icon slot="leading-icon">watch_later</md-icon>
      </md-filled-text-field>

        {/* <!-- pre prehľadnosť použijeme pomocnú metódu --> */}
      { this.renderConditions() }
      </form>

      <div class="duration-slider">
        <span class="label">Predpokladaná doba trvania:&nbsp; </span>
        <span class="label">{this.duration}</span>
        <span class="label">&nbsp;minút</span>
        <md-slider
          min="2" max="45" value={this.entry?.estimatedDurationMinutes || 15} ticks labeled
          oninput={ (ev:InputEvent) => {
            if(this.entry) {
            this.entry.estimatedDurationMinutes
                = Number.parseInt(this.handleInputEvent(ev))};
            this.handleSliderInput(ev)
          } }></md-slider>
      </div>

      <md-divider></md-divider>
      <div class="actions">
        <md-filled-tonal-button id="delete" disabled={!this.entry || this.entry?.id === "@new" }
          onClick={() => this.deleteEntry()}>
          <md-icon slot="icon">delete</md-icon>
          Zmazať
        </md-filled-tonal-button>
        <span class="stretch-fill"></span>
        <md-outlined-button id="cancel"
          onClick={() => this.editorClosed.emit("cancel")}>
          Zrušiť
        </md-outlined-button>
        <md-filled-button id="confirm" disabled={ !this.isValid }
          onClick={() => this.updateEntry() }>
          <md-icon slot="icon">save</md-icon>
          Uložiť
        </md-filled-button>
      </div>
    </Host>
  );
}
}
