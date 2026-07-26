import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class UltraDB {
    #path;
    #saveTimer = null;
    
    constructor() {
        this.#path = path.join(__dirname, 'database.json');
        
        const dir = path.dirname(this.#path);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        
        this.data = this.#load();
        return this.#createProxy();
    }
    
    #load() {
        try {
            if (existsSync(this.#path)) {
                const raw = readFileSync(this.#path, 'utf-8');
                if (raw.trim()) {
                    const parsed = JSON.parse(raw);
                    if (!parsed.groups) parsed.groups = {};
                    if (!parsed.users) parsed.users = {};
                    if (parsed.dev === undefined) parsed.dev = false;
                    if (parsed.ownerOnly === undefined) parsed.ownerOnly = false;
                    return parsed;
                }
            }
        } catch (e) {}
        return { groups: {}, users: {}, dev: false, ownerOnly: false };
    }
    
    #save() {
        if (this.#saveTimer) clearTimeout(this.#saveTimer);
        this.#saveTimer = setTimeout(() => {
            try {
                writeFileSync(this.#path, JSON.stringify(this.data, null, 2));
            } catch (e) {}
            this.#saveTimer = null;
        }, 50);
    }
    
    #isValidId(id) {
        return id && !id.includes('@newsletter') && !id.includes('@lid') && id.includes('@');
    }
    
    #createProxy() {
        const self = this;
        
        return new Proxy(this.data, {
            get(target, prop) {
                if (prop === 'groups') {
                    return new Proxy(target.groups, {
                        get(groupTarget, groupId) {
                            if (!self.#isValidId(groupId)) return undefined;
                            if (!groupTarget[groupId]) {
                                groupTarget[groupId] = {};
                                self.#save();
                            }
                            return new Proxy(groupTarget[groupId], {
                                set(obj, key, val) {
                                    if (val === false || val === 0 || val === undefined || val === null) {
                                        delete obj[key];
                                    } else {
                                        obj[key] = val;
                                    }
                                    if (Object.keys(obj).length === 0) {
                                        delete groupTarget[groupId];
                                    }
                                    self.#save();
                                    return true;
                                },
                                deleteProperty(obj, key) {
                                    delete obj[key];
                                    if (Object.keys(obj).length === 0) {
                                        delete groupTarget[groupId];
                                    }
                                    self.#save();
                                    return true;
                                }
                            });
                        },
                        set(groupTarget, groupId, val) {
                            if (!self.#isValidId(groupId)) return false;
                            if (val && typeof val === 'object' && Object.keys(val).length > 0) {
                                groupTarget[groupId] = val;
                            } else {
                                delete groupTarget[groupId];
                            }
                            self.#save();
                            return true;
                        },
                        deleteProperty(groupTarget, groupId) {
                            delete groupTarget[groupId];
                            self.#save();
                            return true;
                        }
                    });
                }
                
                if (prop === 'users') {
                    return new Proxy(target.users, {
                        get(userTarget, userId) {
                            if (!self.#isValidId(userId)) return undefined;
                            if (!userTarget[userId]) {
                                userTarget[userId] = {};
                                self.#save();
                            }
                            return new Proxy(userTarget[userId], {
                                set(obj, key, val) {
                                    if (val === false || val === 0 || val === undefined || val === null) {
                                        delete obj[key];
                                    } else {
                                        obj[key] = val;
                                    }
                                    if (Object.keys(obj).length === 0) {
                                        delete userTarget[userId];
                                    }
                                    self.#save();
                                    return true;
                                },
                                deleteProperty(obj, key) {
                                    delete obj[key];
                                    if (Object.keys(obj).length === 0) {
                                        delete userTarget[userId];
                                    }
                                    self.#save();
                                    return true;
                                }
                            });
                        },
                        set(userTarget, userId, val) {
                            if (!self.#isValidId(userId)) return false;
                            if (val && typeof val === 'object' && Object.keys(val).length > 0) {
                                userTarget[userId] = val;
                            } else {
                                delete userTarget[userId];
                            }
                            self.#save();
                            return true;
                        },
                        deleteProperty(userTarget, userId) {
                            delete userTarget[userId];
                            self.#save();
                            return true;
                        }
                    });
                }
                
                if (prop === 'dev') {
                    return target.dev;
                }
                
                return target[prop];
            },
            
            set(target, prop, val) {
                if (prop === 'groups' || prop === 'users') {
                    return false;
                }
                target[prop] = val;
                self.#save();
                return true;
            }
        });
    }
}

export default UltraDB;