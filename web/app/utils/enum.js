class Enum {
    constructor(schema) {
        this.all = [];

        schema.forEach(it => {
            const [codename, value, label] = it;
            this[codename] = {value, label};
            this.all.push({codename, value, label});
        });
    }

    label(value) {
        const theOne = this.all.find(it => it.value === value);
        return theOne && theOne.label;
    }

    codename(value) {
        const theOne = this.all.find(it => it.value === value);
        return theOne && theOne.codename;
    }
}

// export const quality = new Enum([

// ])