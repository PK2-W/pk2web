import { PkTickable } from '@ng/support/PkTickable';
import { PkUIComponent } from '@ng/ui/component/PkUIComponent';
import { PkUIContext } from '@ng/ui/PkUIContext';

export abstract class PkUIComponentContainer<T extends PkUIContext = PkUIContext>
    extends PkUIComponent<T>
    implements Iterable<PkUIComponent>, PkTickable {
    
    protected _children: PkUIComponent[];
    
    protected constructor(context: T) {
        super(context);
        
        this._children = [];
    }
    
    
    ///  Content  ///
    
    public hasChildren(): boolean {
        return this._children.length > 0;
    }
    
    public getChildren(): PkUIComponent[] {
        return [...this._children];
    }
    
    public get children(): number {
        return this._children.length;
    }
    
    public has(component: PkUIComponent): boolean {
        return this._children.indexOf(component) > -1;
    }
    
    public add(component: PkUIComponent): this {
        // Add to collection
        this._children.push(component);
        this._drawable.add(component.getDrawable());
        
        // Notify child
        // @ts-ignore
        component._childOf(this);
        
        return this;
    }
    
    public remove(component: PkUIComponent): this {
        const i = this._children.indexOf(component);
        if (i > -1) {
            this._children.splice(i);
            this._drawable.remove(component.getDrawable());
            
            // @ts-ignore
            component._childOf(this);
        }
        
        return this;
    }
    
    public clean(): this {
        if (this.children > 0) {
            this._children = [];
            this._drawable.clear();
        }
        
        return this;
    }
    
    public showAll(): this {
        this._children.forEach((component) => {
            component.show();
        });
        return this;
    }
    
    public hideAll(): this {
        this._children.forEach((component) => {
            component.hide();
        });
        return this;
    }
    
    public [Symbol.iterator](): Iterator<PkUIComponent> {
        return new PkUITreeIterator(this);
    }
    
    
    ///  Game loop  ///
    
    public tick(delta: number, time: number): void {
        // Tick super...
        super.tick(delta, time);
        
        // Tick children
        for (let child of this._children) {
            child.tick(delta, time);
        }
    }
    
    
    /// Interaction  ///
    
    public get propagatePointerEvents(): boolean {
        return this.dw.propagatePointerEvents;
    }
    public set propagatePointerEvents(value: boolean) {
        this.dw.propagatePointerEvents = value;
    }
    
}

export class PkUITreeIterator implements Iterator<PkUIComponent> {
    private _aux: PkUIComponent[];
    
    public constructor(component: PkUIComponentContainer) {
        this._aux = [];
        this._aux.push(...component.getChildren());
    }
    
    public next(): IteratorResult<PkUIComponent, any> {
        if (this._aux.length === 0) {
            return { done: true, value: undefined };
        }
        
        const current = this._aux.shift();
        if (current instanceof PkUIComponentContainer && current.hasChildren()) {
            this._aux.unshift(...current.getChildren());
        }
        
        return { value: current };
    }
}