import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import { EditTaxComponent } from '../../purchase-non-tax/edit-tax/edit-tax.component';
import { PurchasesService } from '../../purchases.service';

@Component({
  selector: 'app-purchase-sales-tax',
  templateUrl: './purchase-sales-tax.component.html',
  styleUrls: ['./purchase-sales-tax.component.css'],
})
export class PurchaseSalesTaxComponent implements OnInit {
  public productSales: any;
  public vendorsCode: any;
  public purchaseSalesTaxTableData: any;
  public isProductCodeLoaded: boolean = false;
  public isPurchaseLoaded: boolean = false;
  public itemCode: any;
  public product_index: number = 0;
  public purchase_index: number = 0;
  public vendorByIdData: any;
  disablePrint: boolean = false;
  displayedColumns: string[] = [
    'discount',
    'types',
    'totalAmount',
    // 'productItemCode',
    'paymentTerms',
    'orderSerialNumber',
    'orderDate',
    'accountType',
    'delete',
    'edit',
  ];
  dataSource: MatTableDataSource<any> | any;
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) sort: MatSort | any;
  constructor(
    private _purchaseService: PurchasesService,
    public dialog: MatDialog,
    private _snackbar :MatSnackBar
  ) {}

  ngOnInit(): void {
    this._purchaseService.getPurchaseOrders().subscribe((response: any) => {
      console.log('get all purchase sales', response);
      this.productSales = response.payload;
    });

    this._purchaseService.getAllVendorCodes().subscribe((response: any) => {
      console.log('get all vendors', response);
      this.vendorsCode = response.payload;
    });

    this._purchaseService
      .getAllPurchaseSalesTaxTable()
      .subscribe((response: any) => {
        console.log('get all tax table', response);
        this.purchaseSalesTaxTableData = response.payload;
        this.dataSource = new MatTableDataSource(
          this.purchaseSalesTaxTableData
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  // addPurchaseSalesTax() {}

  loadProduct(index: number) {
    this.product_index = index;
  }

  loadPurchase(index: number) {
    this.purchase_index = index;
    this.isPurchaseLoaded = true;
    console.log(
      'PURCHASE',
      this.purchaseSalesTaxTableData[this.purchase_index]
    );
    this._purchaseService
      .getVendorById(
        this.purchaseSalesTaxTableData[this.purchase_index].vendorId
      )
      .subscribe((res: any) => {
        this.vendorByIdData = res.payload;
        this.isProductCodeLoaded = true;

        console.log('VENDOR', res.payload);
      });
    let obj = new Array(this.purchaseSalesTaxTableData[this.purchase_index]);
    this.dataSource = obj;
    this.disablePrint = true;
    console.log('HEHEH', this.dataSource);
    // this.dataSource.paginator = this.paginator;
    //     this.dataSource.sort = this.sort;
    // this._purchaseService.getVendorsById(this.purchaseSalesTaxTableData[this.purchase_index].vendorId).subscribe((res:any)=>{
    //   console.log("RES",res)
    //   // this.dataSource = new MatTableDataSource(
    //   //   res.payload
    //   // );
    //   // this.dataSource.paginator = this.paginator;

    // })
  }

  onEdit(index: any) {
    this.dialog.open(EditTaxComponent, {
      data: {
        userData: index,
      },
    });
  }

  onDelete(index: any){
    var text = "Are you sure to delete?";
    console.log('acbcsd',this.purchaseSalesTaxTableData[index.id])
    console.log('INDEXX',index)
    if (confirm(text) == true) {
        this._purchaseService
          .deletePurchseSales(index.id)
          .then(
            (res: any) => {
              window.location.reload();
            },
            (err: any) => {
            }
          );
    }
    else {
      alert('You pressed cancel');
    }

  }

  printReceipt(id: any) {
    let data: any = document.getElementById(id) as HTMLElement;
    let pdf = new jspdf('p', 'mm', 'a4');

    html2canvas(data).then((canvas) => {
      const contentDataURL = canvas.toDataURL('image/png;base64'); // 'image/jpeg' for lower quality output.
      // let pdf = new jspdf('l', 'cm', 'a4'); //Generates PDF in landscape mode
      document.body.appendChild(canvas);
      const imgProps = pdf.getImageProperties(contentDataURL);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(contentDataURL, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('purchase-sales-tax.pdf');
      window.location.reload();
    });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
