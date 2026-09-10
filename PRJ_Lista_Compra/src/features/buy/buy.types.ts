// src/features/buy/buy.types.ts
import { ProductEntity } from '../../data/entities/product.entity';
import { SupplierEntity } from '../../data/entities/supplier.entity';

// Interface do Item do Carrinho de Compras em memória
export interface BuyCartItem {
  id_list_buy?: number;
  id_product: number;
  nm_product: string;
  cd_product_gtin?: string | null;
  id_group?: number;
  nm_group?: string;
  qt_product: number;
  vl_product?: number;
  dt_list_buy?: string;
}

// Estado Imutável do fluxo MVI
export interface BuyState {
  items: BuyCartItem[];
  loading: boolean;
  error: string | null;
}

// Intenções do Usuário (MVI Intention)
export type BuyIntent =
  | { type: 'LOAD_BUY_LIST' }
  | { type: 'ADD_PRODUCT'; payload: { product: ProductEntity } }
  | { type: 'UPDATE_ITEM'; payload: { index: number; quantity: number; value?: number } }
  | { type: 'REMOVE_ITEM'; payload: { index: number } }
  | { type: 'FINALIZE'; payload: { id_supplier: number } };

// Propriedades do Formulário - Ações principais (Utilizar Lista / Adicionar Produto)
export interface BuyActionsProps {
  onOpenBuyList: () => void;
  onToggleAddOptions: () => void;
}

// Propriedades do Formulário - Opções de Adição (Câmera / Nome)
export interface BuyAddOptionsProps {
  onOpenCamera: () => void;
  onOpenNameSearch: () => void;
}

// Propriedades do Modal de Edição do Item
export interface BuyItemModalProps {
  visible: boolean;
  item: BuyCartItem | null;
  quantityText: string;
  valueText: string;
  onChangeQuantity: (text: string) => void;
  onChangeValue: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
}

// Propriedades do Modal de Seleção de Fornecedor
export interface FinishBuyModalProps {
  visible: boolean;
  suppliers: SupplierEntity[];
  onSelectSupplier: (supplier: SupplierEntity) => void;
  onClose: () => void;
}

// Propriedades do Modal de Pesquisa de Produto por Nome
export interface BuyNameSearchModalProps {
  visible: boolean;
  onSelectProduct: (product: ProductEntity | Pick<ProductEntity, 'id_product' | 'nm_product'>) => void;
  onClose: () => void;
  onSearchProducts: (query: string) => Promise<Array<Pick<ProductEntity, 'id_product' | 'nm_product'>>>;
}