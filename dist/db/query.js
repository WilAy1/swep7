"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const makeObjectUnique_1 = require("../utils/makeObjectUnique");
const connect_1 = __importDefault(require("./connect"));
class Query {
    constructor(table) {
        this.table = table;
    }
    /**
     *
     * @param conditions
     * @param keysLength - length of keys and values
     * @returns
     */
    generateCondition(conditions, keysLength = 0) {
        const optionalLength = conditions.optional?.length || 0;
        const compulsoryConditions = conditions.compulsory?.map((key, index) => `${key.key} = $${keysLength + optionalLength + index + 1}`);
        const optionalConditions = conditions.optional?.map((key, index) => `${key.key} = $${keysLength + index + 1}`);
        let conditionStatement;
        if (optionalConditions && compulsoryConditions) {
            conditionStatement = `WHERE (${optionalConditions.join(' OR ')}) OR (${compulsoryConditions.join(' AND ')})`;
        }
        else if (optionalConditions) {
            conditionStatement = `WHERE (${optionalConditions.join(' OR ')})`;
        }
        else if (compulsoryConditions) {
            conditionStatement = `WHERE (${compulsoryConditions.join(' AND ')})`;
        }
        else {
            conditionStatement = "";
        }
        return conditionStatement;
    }
    generateSelectQuery(cols, conditions) {
        const selectFrom = cols?.join(', ') || "*";
        let conditionStatement = "";
        let conditionValues = [];
        if (conditions) {
            conditionStatement = this.generateCondition(conditions);
            conditionValues = (conditions.optional?.map((key, _) => key.value) || [])
                .concat((conditions.compulsory?.map((key, _) => key.value)) || []);
        }
        const query = `SELECT ${selectFrom} FROM ${this.table} ${conditionStatement}`;
        return {
            query: query,
            conditionValues: conditionValues
        };
    }
    generateInsertQuery(keys, values, returnColumn) {
        const returnCol = returnColumn ? `RETURNING ${returnColumn}` : '';
        const placeholders = values.map((_, index) => `$${index + 1}`);
        const columns = keys.join(', ');
        const placeholdersString = placeholders.join(', ');
        return `INSERT INTO ${this.table} (${columns}) VALUES (${placeholdersString}) ${returnCol}`;
    }
    generateUpdateQuery(keys, conditions) {
        const assignment = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        const conditionStatement = this.generateCondition(conditions, keys.length);
        const query = `UPDATE ${this.table} SET ${assignment} ${conditionStatement}`;
        const conditionValues = (conditions.optional?.map((key, _) => key.value) || [])
            .concat((conditions.compulsory?.map((key, _) => key.value)) || []);
        return {
            query: query,
            conditionValues: conditionValues
        };
    }
    generateDeleteQuery(conditions) {
        const conditionMerged = (conditions.optional || []).concat(conditions.compulsory || []);
        //const cols = conditionMerged
        //                .map((key, _) => `${key.key}`)
        //.filter((value, index, array) => array.indexOf(value) == index);
        const mergedCols = (0, makeObjectUnique_1.makeObjectUnique)(conditionMerged);
        const cols = Object.keys(mergedCols).join(', ');
        //placeholder
        let placeholderValue = 0;
        const varPlaceholders = Object.values(mergedCols).map((value) => {
            return `(${value.map((_) => {
                placeholderValue += 1;
                const inner = `$${placeholderValue}`;
                return inner;
            }).join(',')})`;
        }).join(', ');
        const vars = Object.values(mergedCols).map((value) => value.join(', '));
        const conditionStatement = cols && vars ? `WHERE (${cols}) IN (${varPlaceholders})` : '';
        const query = `DELETE FROM ${this.table} ${conditionStatement}`;
        return {
            query: query,
            conditionValues: vars
        };
    }
    // global
    async update(keys, values, conditions) {
        try {
            if (keys.length == 0 && keys.length != values.length && !(conditions.compulsory || conditions.optional)) {
                throw new Error("Length of keys doesn't match length of values or no condition provided");
            }
            const generateQuery = this.generateUpdateQuery(keys, conditions);
            await connect_1.default.query(generateQuery.query, values.concat(generateQuery.conditionValues));
            return true;
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
    async insert(keys, values, { returnColumn } = { returnColumn: null }) {
        try {
            if (keys.length == 0 && keys.length != values.length) {
                throw new Error("Length of keys doesn't match length of values");
            }
            const query = this.generateInsertQuery(keys, values, returnColumn);
            const response = await connect_1.default.query(query, values); // insert into table
            return response.rows[0];
        }
        catch (error) {
            // failed to insert
            console.error(error);
            throw new Error(error);
        }
    }
    async delete(conditions) {
        try {
            const deleteCondition = this.generateCondition(conditions);
            const query = `DELETE FROM ${this.table} ${deleteCondition}`;
            const conditionValues = (conditions.optional?.map((key, _) => key.value) || [])
                .concat((conditions.compulsory?.map((key, _) => key.value)) || []);
            await connect_1.default.query(query, conditionValues); // delete in table
            return true;
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
    async select(params) {
        try {
            const generateQuery = this.generateSelectQuery(params.cols, params.conditions);
            const result = await connect_1.default.query(generateQuery.query, generateQuery.conditionValues);
            return result.rows;
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
    async customQuery(query, values) {
        try {
            const result = await connect_1.default.query(query, values);
            return result;
        }
        catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }
}
exports.default = Query;
//# sourceMappingURL=query.js.map